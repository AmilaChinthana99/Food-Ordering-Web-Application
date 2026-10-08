import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || typeof subtotal !== 'number') {
      return sendError(res, 'Code and subtotal are required', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return sendError(res, 'Invalid or inactive promo code', 404);
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return sendError(res, 'Promo code has expired', 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return sendError(res, 'Promo code usage limit reached', 400);
    }

    if (subtotal < coupon.minOrderValue) {
      return sendError(res, `Minimum order value for this coupon is Rs. ${coupon.minOrderValue}`, 400);
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return sendSuccess(res, {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discount),
    }, 'Coupon validated successfully');
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, coupons, 'Coupons fetched');
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiresAt, usageLimit } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        discountValue,
        minOrderValue: minOrderValue || 0,
        maxDiscount,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit,
      },
    });

    return sendSuccess(res, coupon, 'Coupon created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    return sendSuccess(res, null, 'Coupon deleted');
  } catch (error) {
    next(error);
  }
};
