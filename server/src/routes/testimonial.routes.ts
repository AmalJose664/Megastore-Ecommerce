import { Router } from 'express';
import { testimonialController } from '../controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

// Public routes
router.get('/', testimonialController.getTestimonials);

// Admin routes
router.post(
    '/',
    authenticate,
    authorize(UserRole.ADMIN),
    testimonialController.createTestimonial
);

router.put(
    '/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    testimonialController.updateTestimonial
);

router.delete(
    '/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    testimonialController.deleteTestimonial
);

export default router;
