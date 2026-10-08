import { Router } from 'express';
import { getPlatformAnalytics, exportOrdersCSV } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'), getPlatformAnalytics);
router.get('/export-orders', authenticate, authorize('SUPER_ADMIN'), exportOrdersCSV);

export default router;
