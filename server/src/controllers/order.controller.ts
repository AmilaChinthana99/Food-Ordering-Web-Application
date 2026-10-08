import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { emitOrderStatusUpdate, emitNewOrderNotification } from '../services/socket.service';
import { createStripePaymentIntent } from '../services/stripe.service';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const {
      restaurantId,
      addressId,
      deliveryAddress,
      orderType,
      paymentMethod,
      items,
      couponCode,
      specialInstructions,
    } = req.body;

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }

    if (!restaurant.isOpen) {
      return sendError(res, 'Restaurant is currently closed', 400);
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      let itemPrice = item.price;
      const addOnsCost = (item.addOns || []).reduce((acc: number, addon: any) => acc + (addon.price || 0), 0);
      const totalPerItem = (itemPrice + addOnsCost) * item.quantity;
      subtotal += totalPerItem;

      orderItemsData.push({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variantName: item.variantName || null,
        addOnsJson: item.addOns ? JSON.stringify(item.addOns) : null,
        notes: item.notes || null,
      });
    }

    if (subtotal < restaurant.minOrder) {
      return sendError(res, `Minimum order amount for ${restaurant.name} is Rs. ${restaurant.minOrder}`, 400);
    }

    const deliveryFee = orderType === 'PICKUP' ? 0 : restaurant.deliveryFee;
    const tax = Math.round(subtotal * 0.05); // 5% tax

    // Process coupon
    let discount = 0;
    let couponId: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive && subtotal >= coupon.minOrderValue) {
        couponId = coupon.id;
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        } else {
          discount = coupon.discountValue;
        }
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    const totalAmount = Math.max(0, Math.round(subtotal + deliveryFee + tax - discount));
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const deliveryAddressJson = deliveryAddress
      ? JSON.stringify(deliveryAddress)
      : addressId
      ? JSON.stringify(await prisma.address.findUnique({ where: { id: addressId } }))
      : null;

    // Create Order in Database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        restaurantId,
        addressId: addressId || null,
        deliveryAddressJson,
        orderType,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        orderStatus: 'PLACED',
        subtotal,
        deliveryFee,
        tax,
        discount,
        totalAmount,
        couponId,
        specialInstructions,
        estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000), // ~35 mins
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        restaurant: {
          select: { id: true, name: true, logo: true, phone: true, address: true },
        },
        user: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    let clientSecret = null;
    let stripePaymentIntentId = null;

    if (paymentMethod === 'CARD') {
      const paymentIntent = await createStripePaymentIntent(totalAmount, 'lkr', { orderId: order.id });
      clientSecret = paymentIntent.client_secret;
      stripePaymentIntentId = paymentIntent.id;

      await prisma.payment.create({
        data: {
          orderId: order.id,
          stripePaymentIntentId,
          amount: totalAmount,
          currency: 'LKR',
          status: 'PENDING',
          method: 'CARD',
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          currency: 'LKR',
          status: 'PENDING',
          method: 'COD',
        },
      });
    }

    // Emit real-time socket event
    emitNewOrderNotification(restaurantId, order);

    return sendSuccess(res, { order, clientSecret }, 'Order placed successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { status, restaurantId, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (userRole === 'CUSTOMER') {
      where.userId = userId;
    } else if (userRole === 'RESTAURANT_ADMIN') {
      // Find restaurants owned by this admin
      const ownedRestaurants = await prisma.restaurant.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      const ownedIds = ownedRestaurants.map((r) => r.id);
      if (restaurantId) {
        where.restaurantId = restaurantId as string;
      } else {
        where.restaurantId = { in: ownedIds };
      }
    } else if (userRole === 'SUPER_ADMIN' && restaurantId) {
      where.restaurantId = restaurantId as string;
    }

    if (status && status !== 'ALL') {
      where.orderStatus = status as any;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          restaurant: {
            select: { id: true, name: true, logo: true, phone: true },
          },
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          reviews: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return sendSuccess(res, orders, 'Orders fetched', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        restaurant: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        address: true,
        payments: true,
        reviews: true,
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, order, 'Order details retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, cancelledReason } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    const updatedData: any = { orderStatus: status };
    if (cancelledReason) updatedData.cancelledReason = cancelledReason;

    if (status === 'DELIVERED') {
      updatedData.paymentStatus = 'COMPLETED';
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updatedData,
      include: {
        items: true,
        restaurant: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Emit live status update to user, order room, and restaurant
    emitOrderStatusUpdate(order.id, order.userId, order.restaurantId, updatedOrder);

    return sendSuccess(res, updatedOrder, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.userId !== userId && req.user!.role !== 'SUPER_ADMIN') {
      return sendError(res, 'Unauthorized to cancel this order', 403);
    }

    if (order.orderStatus !== 'PLACED') {
      return sendError(res, 'Orders can only be cancelled while in "PLACED" status', 400);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: 'CANCELLED',
        cancelledReason: reason || 'Cancelled by customer',
      },
      include: { items: true, restaurant: true },
    });

    emitOrderStatusUpdate(order.id, order.userId, order.restaurantId, updatedOrder);

    return sendSuccess(res, updatedOrder, 'Order cancelled successfully');
  } catch (error) {
    next(error);
  }
};
