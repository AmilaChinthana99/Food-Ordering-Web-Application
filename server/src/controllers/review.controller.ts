import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { restaurantId, orderId, rating, comment } = req.body;

    if (!restaurantId || !rating || !comment) {
      return sendError(res, 'Restaurant ID, rating, and comment are required', 400);
    }

    const review = await prisma.review.create({
      data: {
        userId,
        restaurantId,
        orderId,
        rating: Math.min(5, Math.max(1, rating)),
        comment,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update restaurant average rating
    const aggregate = await prisma.review.aggregate({
      where: { restaurantId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        rating: aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 4.5,
        reviewCount: aggregate._count.rating,
      },
    });

    return sendSuccess(res, review, 'Review submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { restaurant: true },
    });

    if (!review) {
      return sendError(res, 'Review not found', 404);
    }

    if (review.restaurant.ownerId !== req.user!.userId && req.user!.role !== 'SUPER_ADMIN') {
      return sendError(res, 'Unauthorized to reply to this review', 403);
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { reply },
    });

    return sendSuccess(res, updated, 'Reply added to review');
  } catch (error) {
    next(error);
  }
};
