import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router: Router = Router();

// All user management routes require Admin authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/', userController.getUsers);
router.get('/:id', validateMongoId('id'), userController.getUserById);
router.patch('/:id/status', validateMongoId('id'), userController.updateUserStatus);
router.put('/:id/status', validateMongoId('id'), userController.updateUserStatus);

export default router;
