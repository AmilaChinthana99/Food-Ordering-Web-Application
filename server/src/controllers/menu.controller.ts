import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { restaurantId, categoryId, search, isVeg, isPopular } = req.query;

    const where: any = {};
    if (restaurantId) where.restaurantId = restaurantId as string;
    if (categoryId) where.categoryId = categoryId as string;
    if (isVeg === 'true') where.isVeg = true;
    if (isPopular === 'true') where.isPopular = true;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        category: true,
        restaurant: {
          select: { id: true, name: true, slug: true, isOpen: true, deliveryFee: true },
        },
        variants: true,
        addOns: true,
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, menuItems, 'Menu items fetched');
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        restaurant: true,
        variants: true,
        addOns: true,
      },
    });

    if (!menuItem) {
      return sendError(res, 'Menu item not found', 404);
    }

    return sendSuccess(res, menuItem, 'Menu item retrieved');
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId, categoryId, name, description, price, image, isVeg, isAvailable, isPopular, variants, addOns } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Verify user owns restaurant or is super admin
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }

    if (restaurant.ownerId !== userId && userRole !== 'SUPER_ADMIN') {
      return sendError(res, 'Unauthorized to add items to this restaurant', 403);
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId,
        categoryId,
        name,
        description,
        price,
        image,
        isVeg: isVeg ?? false,
        isAvailable: isAvailable ?? true,
        isPopular: isPopular ?? false,
        variants: variants?.length ? {
          create: variants,
        } : undefined,
        addOns: addOns?.length ? {
          create: addOns,
        } : undefined,
      },
      include: {
        variants: true,
        addOns: true,
        category: true,
      },
    });

    return sendSuccess(res, menuItem, 'Menu item created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { categoryId, name, description, price, image, isVeg, isAvailable, isPopular, variants, addOns } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const existing = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!existing) {
      return sendError(res, 'Menu item not found', 404);
    }

    if (existing.restaurant.ownerId !== userId && userRole !== 'SUPER_ADMIN') {
      return sendError(res, 'Unauthorized to edit this item', 403);
    }

    // Delete existing variants/addOns if new ones provided
    if (variants) {
      await prisma.itemVariant.deleteMany({ where: { menuItemId: id } });
    }
    if (addOns) {
      await prisma.addOn.deleteMany({ where: { menuItemId: id } });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        categoryId,
        name,
        description,
        price,
        image,
        isVeg,
        isAvailable,
        isPopular,
        variants: variants?.length ? { create: variants } : undefined,
        addOns: addOns?.length ? { create: addOns } : undefined,
      },
      include: {
        variants: true,
        addOns: true,
        category: true,
      },
    });

    return sendSuccess(res, updated, 'Menu item updated successfully');
  } catch (error) {
    next(error);
  }
};

export const toggleMenuItemAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Menu item not found', 404);
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !existing.isAvailable },
    });

    return sendSuccess(res, updated, `Item availability set to ${updated.isAvailable}`);
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    return sendSuccess(res, null, 'Menu item deleted');
  } catch (error) {
    next(error);
  }
};
