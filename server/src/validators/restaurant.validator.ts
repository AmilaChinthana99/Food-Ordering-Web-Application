import { z } from 'zod';

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Restaurant name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    cuisine: z.string().min(2, 'Cuisine is required'),
    deliveryFee: z.number().min(0).optional(),
    minOrder: z.number().min(0).optional(),
    preparationTime: z.string().optional(),
    address: z.string().min(5, 'Address is required'),
    phone: z.string().min(6, 'Phone is required'),
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    openingHours: z.string().optional(),
  }),
});

export const updateRestaurantSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    cuisine: z.string().optional(),
    deliveryFee: z.number().optional(),
    minOrder: z.number().optional(),
    preparationTime: z.string().optional(),
    isOpen: z.boolean().optional(),
    isApproved: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    openingHours: z.string().optional(),
  }),
});
