import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string(),
    addressId: z.string().optional(),
    deliveryAddress: z.object({
      street: z.string(),
      city: z.string(),
      phone: z.string(),
    }).optional(),
    orderType: z.enum(['DELIVERY', 'PICKUP']),
    paymentMethod: z.enum(['CARD', 'COD']),
    items: z.array(z.object({
      menuItemId: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().int().positive(),
      variantName: z.string().optional(),
      addOns: z.array(z.object({
        name: z.string(),
        price: z.number(),
      })).optional(),
      notes: z.string().optional(),
    })).min(1, 'Order must contain at least one item'),
    couponCode: z.string().optional(),
    specialInstructions: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
    cancelledReason: z.string().optional(),
  }),
});
