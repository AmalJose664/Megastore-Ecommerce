import { Router } from 'express';
import { bannerSectionController } from '../controllers/bannerSection.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

// Public routes
router.get('/active', bannerSectionController.getActiveSections);
router.get('/:id', validateMongoId('id'), bannerSectionController.getSectionById);

// Admin routes
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  bannerSectionController.getAllSections
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  bannerSectionController.createSection
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateMongoId('id'),
  bannerSectionController.updateSection
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateMongoId('id'),
  bannerSectionController.deleteSection
);

export default router;
