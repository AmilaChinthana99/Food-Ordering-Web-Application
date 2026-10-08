import { Router } from 'express';
import {
  getRestaurants,
  getRestaurantBySlugOrId,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../controllers/restaurant.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createRestaurantSchema, updateRestaurantSchema } from '../validators/restaurant.validator';

const router = Router();

router.get('/', getRestaurants);
router.get('/:identifier', getRestaurantBySlugOrId);

router.post(
  '/',
  authenticate,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  validateRequest(createRestaurantSchema),
  createRestaurant
);

router.put(
  '/:id',
  authenticate,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  validateRequest(updateRestaurantSchema),
  updateRestaurant
);

router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteRestaurant);

export default router;
