import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRegistration, validateLogin } from '../middlewares/validation.middleware';

const router = Router();

router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

export default router;