import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes (User)
router.use(authenticate);

router.post('/', reviewController.addReview);
router.get('/my-reviews', reviewController.getUserReviews);
router.patch('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

// Admin routes
router.use(authorize(UserRole.ADMIN));

router.patch('/:id/approve', reviewController.approveReview);

export default router;
