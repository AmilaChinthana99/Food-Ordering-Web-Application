import { Router } from 'express';
import { validateCoupon, getCoupons, createCoupon, deleteCoupon } from '../controllers/coupon.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/', getCoupons);
router.post('/', authenticate, authorize('SUPER_ADMIN'), createCoupon);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteCoupon);

export default router;
