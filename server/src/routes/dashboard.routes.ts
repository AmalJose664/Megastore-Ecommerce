import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

router.get('/test', (_req, res) => res.json({ success: true, message: 'Dashboard router reached' }));

router.get(
    '/admin',
    authenticate,
    authorize(UserRole.ADMIN),
    dashboardController.getAdminDashboard
);

export default router;
