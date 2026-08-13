import { Router } from 'express';
import { bannerController } from '../controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();



// Admin routes for banner management
router.get(
    '/banners',
    authenticate,
    authorize(UserRole.ADMIN),
    bannerController.getAllBanners
);

router.post(
    '/banners',
    authenticate,
    authorize(UserRole.ADMIN),
    bannerController.createBanner
);

router.put(
    '/banners/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    bannerController.updateBanner
);

router.delete(
    '/banners/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    bannerController.deleteBanner
);

export default router;
