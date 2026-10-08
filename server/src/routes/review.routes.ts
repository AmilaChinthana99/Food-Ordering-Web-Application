import { Router } from 'express';
import { createReview, replyToReview } from '../controllers/review.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, createReview);
router.post('/:reviewId/reply', authenticate, authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'), replyToReview);

export default router;
