import { Router } from 'express';
import { promoController } from '../controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

// Public routes for sections
router.get('/', promoController.getPromoSection);

// Admin routes for promo management
router.get(
    '/all',
    authenticate,
    authorize(UserRole.ADMIN),
    promoController.getAllPromos
);

router.post(
    '/',
    authenticate,
    authorize(UserRole.ADMIN),
    promoController.createPromo
);

router.put(
    '/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    promoController.updatePromo
);

router.delete(
    '/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    promoController.deletePromo
);

router.patch(
    '/:id/activate',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    promoController.activatePromo
);

router.patch(
    '/:id/deactivate',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    promoController.deactivatePromo
);

export default router;
