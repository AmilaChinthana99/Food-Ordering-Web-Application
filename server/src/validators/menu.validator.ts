import { z } from 'zod';

export const createMenuItemSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid(),
    categoryId: z.string().uuid(),
    name: z.string().min(2, 'Name is required'),
    description: z.string().min(5, 'Description is required'),
    price: z.number().positive('Price must be greater than 0'),
    image: z.string().optional(),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    variants: z.array(z.object({
      name: z.string(),
      price: z.number(),
    })).optional(),
    addOns: z.array(z.object({
      name: z.string(),
      price: z.number(),
    })).optional(),
  }),
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    categoryId: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    image: z.string().optional(),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    variants: z.array(z.object({
      name: z.string(),
      price: z.number(),
    })).optional(),
    addOns: z.array(z.object({
      name: z.string(),
      price: z.number(),
    })).optional(),
  }),
});
