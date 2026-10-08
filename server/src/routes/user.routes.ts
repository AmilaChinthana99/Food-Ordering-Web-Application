import { Router } from 'express';
import { getUsers, updateUserStatus } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('SUPER_ADMIN'), getUsers);
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN'), updateUserStatus);

export default router;
