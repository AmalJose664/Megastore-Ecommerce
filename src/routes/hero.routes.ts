import { Router } from 'express';
import { heroController } from '../controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

// Public routes for sections
router.get('/', heroController.getHeroSection);

// Admin routes for hero management
router.get(
    '/all',
    authenticate,
    authorize(UserRole.ADMIN),
    heroController.getAllHeroes
);

router.post(
    '/',
    authenticate,
    authorize(UserRole.ADMIN),
    heroController.createHero
);

router.put(
    '/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    heroController.updateHero
);

router.delete(
    '/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    heroController.deleteHero
);

router.patch(
    '/:id/activate',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    heroController.activateHero
);

router.patch(
    '/:id/deactivate',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    heroController.deactivateHero
);

export default router;
