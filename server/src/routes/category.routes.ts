import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, authorize('SUPER_ADMIN'), createCategory);
router.put('/:id', authenticate, authorize('SUPER_ADMIN'), updateCategory);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteCategory);

export default router;
