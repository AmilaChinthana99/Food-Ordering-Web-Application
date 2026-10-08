import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

router.post('/', authenticate, validateRequest(createOrderSchema), createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);

router.patch(
  '/:id/status',
  authenticate,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus
);

router.post('/:id/cancel', authenticate, cancelOrder);

export default router;
