import { Router } from 'express';
import { settingController } from '../controllers/setting.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Public route
router.get('/', settingController.getSettings);

// Admin route
router.put(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  settingController.updateSettings
);

export default router;
