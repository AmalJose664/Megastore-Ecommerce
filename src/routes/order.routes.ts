import { Router } from 'express';
import { orderController } from '../controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', validateMongoId('id'), orderController.getOrderById);
router.post('/:id/cancel', validateMongoId('id'), orderController.cancelOrder);

// Admin routes
router.get('/admin/all', authorize(UserRole.ADMIN), orderController.getAllOrders);
router.patch('/:id/status', authorize(UserRole.ADMIN), validateMongoId('id'), orderController.updateOrderStatus);
router.get('/admin/stats', authorize(UserRole.ADMIN), orderController.getOrderStats);

export default router;