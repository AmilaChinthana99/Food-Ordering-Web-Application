import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const toggleFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { restaurantId, menuItemId } = req.body;

    if (!restaurantId && !menuItemId) {
      return sendError(res, 'Must provide restaurantId or menuItemId', 400);
    }

    const existing = await prisma.favorite.findFirst({
      where: {
        userId,
        restaurantId: restaurantId || null,
        menuItemId: menuItemId || null,
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return sendSuccess(res, { isFavorite: false }, 'Removed from favorites');
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          restaurantId: restaurantId || null,
          menuItemId: menuItemId || null,
        },
      });
      return sendSuccess(res, { isFavorite: true }, 'Added to favorites');
    }
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        restaurant: true,
        menuItem: {
          include: { category: true, restaurant: true },
        },
      },
    });

    return sendSuccess(res, favorites, 'Favorites fetched');
  } catch (error) {
    next(error);
  }
};
