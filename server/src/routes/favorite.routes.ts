import { Router } from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favorite.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/toggle', authenticate, toggleFavorite);
router.get('/', authenticate, getFavorites);

export default router;
