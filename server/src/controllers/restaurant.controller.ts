import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      cuisine,
      minRating,
      openOnly,
      page = '1',
      limit = '12',
      sortBy = 'rating',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isApproved: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { cuisine: { contains: search as string } },
      ];
    }

    if (cuisine && cuisine !== 'All') {
      where.cuisine = { contains: cuisine as string };
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating as string) };
    }

    if (openOnly === 'true') {
      where.isOpen = true;
    }

    let orderBy: any = {};
    if (sortBy === 'rating') {
      orderBy = { rating: order };
    } else if (sortBy === 'deliveryFee') {
      orderBy = { deliveryFee: order };
    } else if (sortBy === 'name') {
      orderBy = { name: order };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          _count: {
            select: { menuItems: true, reviews: true },
          },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return sendSuccess(res, restaurants, 'Restaurants fetched successfully', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantBySlugOrId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params;

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        menuItems: {
          where: { isAvailable: true },
          include: {
            category: true,
            variants: true,
            addOns: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }

    return sendSuccess(res, restaurant, 'Restaurant fetched');
  } catch (error) {
    next(error);
  }
};

export const createRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { name, description, cuisine, deliveryFee, minOrder, preparationTime, address, phone, logo, coverImage, openingHours } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const isSuperAdmin = req.user!.role === 'SUPER_ADMIN';

    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: userId,
        name,
        slug,
        description,
        cuisine,
        deliveryFee: deliveryFee ?? 250,
        minOrder: minOrder ?? 500,
        preparationTime: preparationTime || '25-35 min',
        address,
        phone,
        logo,
        coverImage,
        openingHours,
        isApproved: isSuperAdmin, // auto approve if created by Super Admin
      },
    });

    return sendSuccess(res, restaurant, 'Restaurant created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Restaurant not found', 404);
    }

    if (existing.ownerId !== userId && userRole !== 'SUPER_ADMIN') {
      return sendError(res, 'You do not have permission to edit this restaurant', 403);
    }

    const updated = await prisma.restaurant.update({
      where: { id },
      data: req.body,
    });

    return sendSuccess(res, updated, 'Restaurant updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.restaurant.delete({ where: { id } });
    return sendSuccess(res, null, 'Restaurant deleted');
  } catch (error) {
    next(error);
  }
};
