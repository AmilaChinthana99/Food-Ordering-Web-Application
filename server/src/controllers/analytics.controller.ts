import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Parser } from 'json2csv';

export const getPlatformAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    let restaurantFilter: any = {};
    if (userRole === 'RESTAURANT_ADMIN') {
      const owned = await prisma.restaurant.findMany({ where: { ownerId: userId }, select: { id: true } });
      restaurantFilter = { restaurantId: { in: owned.map((r) => r.id) } };
    }

    const totalOrders = await prisma.order.count({ where: restaurantFilter });
    const pendingOrders = await prisma.order.count({
      where: { ...restaurantFilter, orderStatus: 'PLACED' },
    });

    const revenueResult = await prisma.order.aggregate({
      where: { ...restaurantFilter, orderStatus: 'DELIVERED' },
      _sum: { totalAmount: true },
    });

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalRestaurants = await prisma.restaurant.count();

    // Top selling items / top restaurants
    const topRestaurants = await prisma.restaurant.findMany({
      take: 5,
      orderBy: { rating: 'desc' },
      select: { id: true, name: true, rating: true, reviewCount: true, logo: true },
    });

    // Orders over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.order.findMany({
      where: {
        ...restaurantFilter,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        orderStatus: true,
      },
    });

    // Group by date
    const dailyStats: Record<string, { date: string; orders: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyStats[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
    }

    recentOrders.forEach((ord) => {
      const dateStr = ord.createdAt.toISOString().split('T')[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].orders += 1;
        if (ord.orderStatus === 'DELIVERED') {
          dailyStats[dateStr].revenue += ord.totalAmount;
        }
      }
    });

    const chartData = Object.values(dailyStats);

    return sendSuccess(res, {
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalUsers,
      totalRestaurants,
      topRestaurants,
      chartData,
    }, 'Analytics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const exportOrdersCSV = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        restaurant: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedData = orders.map((o) => ({
      'Order ID': o.orderNumber,
      'Customer Name': o.user.name,
      'Customer Email': o.user.email,
      'Restaurant': o.restaurant.name,
      'Order Type': o.orderType,
      'Payment Method': o.paymentMethod,
      'Payment Status': o.paymentStatus,
      'Order Status': o.orderStatus,
      'Subtotal (LKR)': o.subtotal,
      'Delivery Fee (LKR)': o.deliveryFee,
      'Tax (LKR)': o.tax,
      'Discount (LKR)': o.discount,
      'Total Amount (LKR)': o.totalAmount,
      'Date': o.createdAt.toISOString(),
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(formattedData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`orders_export_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};
