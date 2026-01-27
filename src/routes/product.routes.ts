import { Router } from 'express';
import { productController } from '../controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateMongoId, validateProductCreation } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/new', productController.getNewProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', validateMongoId('id'), productController.getProductById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validateProductCreation,
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateMongoId('id'),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateMongoId('id'),
  productController.deleteProduct
);

export default router;