import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Only admins can view activity feed
router.get('/', authenticate, authorize(UserRole.ADMIN), activityController.getRecentActivities);

export default router;
