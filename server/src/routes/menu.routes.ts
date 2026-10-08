import { Router } from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
} from '../controllers/menu.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

router.post('/', authenticate, authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'), createMenuItem);
router.put('/:id', authenticate, authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'), updateMenuItem);
router.patch('/:id/toggle-availability', authenticate, authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'), toggleMenuItemAvailability);
router.delete('/:id', authenticate, authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'), deleteMenuItem);

export default router;
