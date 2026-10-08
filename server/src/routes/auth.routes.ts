import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema, updateProfileSchema, addressSchema } from '../validators/auth.validator';
import { authLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/refresh-token', validateRequest(refreshTokenSchema), refreshToken);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), updateProfile);

router.get('/addresses', authenticate, getAddresses);
router.post('/addresses', authenticate, validateRequest(addressSchema), addAddress);
router.delete('/addresses/:addressId', authenticate, deleteAddress);

export default router;
