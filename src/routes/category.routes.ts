import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';
import { categoryController } from '../controllers/category.controller';
import { UserRole } from '../types';

const router = Router();

/**
 * Public Routes
 */

// GET /api/v1/categories - Get all categories in tree structure
router.get('/', categoryController.getCategoryTree);

// GET /api/v1/categories/:slug - Get category by slug
router.get('/:slug', categoryController.getCategoryBySlug);

/**
 * Admin Routes
 */

// POST /api/v1/categories - Create category/subcategory
router.post(
    '/',
    authenticate,
    authorize(UserRole.ADMIN),
    categoryController.createCategory
);

// PUT /api/v1/categories/:id - Update category
router.put(
    '/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    categoryController.updateCategory
);

// DELETE /api/v1/categories/:id - Soft delete category
router.delete(
    '/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    validateMongoId('id'),
    categoryController.deleteCategory
);

// GET /api/v1/categories/admin/all - Get all categories (including inactive)
router.get(
    '/admin/all',
    authenticate,
    authorize(UserRole.ADMIN),
    categoryController.getAllCategories
);

// GET /api/v1/categories/:id/subcategories - Get subcategories
router.get(
    '/:id/subcategories',
    validateMongoId('id'),
    categoryController.getSubcategories
);

export default router;