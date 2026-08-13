import { Request, Response } from 'express';
import { categoryService, CategoryService } from '../services/category.service';
import { asyncHandler } from '../utils/asyncHandler';

export class CategoryController {
    constructor(private categorySer: CategoryService) { }

    /**
     * GET /api/v1/categories
     * Get all categories in tree structure
     */
    getCategoryTree = asyncHandler(async (_req: Request, res: Response) => {
        const categories = await this.categorySer.getCategoryTree();

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories,
        });
    });

    /**
     * GET /api/v1/categories/:slug
     * Get category details by slug
     */
    getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
        const { slug } = req.params;

        const category = await this.categorySer.getCategoryBySlug(slug);

        res.status(200).json({
            success: true,
            message: 'Category retrieved successfully',
            data: category,
        });
    });

    /**
     * POST /api/v1/categories
     * Create a new category or subcategory (Admin only)
     */
    createCategory = asyncHandler(async (req: Request, res: Response) => {
        const { name, description, image, parentCategory, displayOrder } = req.body;

        // Validation
        if (!name || name.trim() === '') {
            res.status(400).json({
                success: false,
                message: 'Category name is required',
            });
            return;
        }

        const categoryData = {
            name: name.trim(),
            description: description?.trim(),
            image,
            parentCategory,
            displayOrder,
        };

        const category = await this.categorySer.createCategory(categoryData);

        res.status(201).json({
            success: true,
            message: parentCategory
                ? 'Subcategory created successfully'
                : 'Category created successfully',
            data: category,
        });
    });

    /**
     * PUT /api/v1/categories/:id
     * Update category details (Admin only)
     */
    updateCategory = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, description, image, parentCategory, displayOrder, isActive } = req.body;

        const updateData: any = {};

        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim();
        if (image !== undefined) updateData.image = image;
        if (parentCategory !== undefined) updateData.parentCategory = parentCategory;
        if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
        if (isActive !== undefined) updateData.isActive = isActive;

        const category = await this.categorySer.updateCategory(id, updateData);

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category,
        });
    });

    /**
     * DELETE /api/v1/categories/:id
     * Soft delete category (Admin only)
     */
    deleteCategory = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        await this.categorySer.deleteCategory(id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
        });
    });

    /**
     * GET /api/v1/categories/admin/all
     * Get all categories including inactive (Admin only)
     */
    getAllCategories = asyncHandler(async (req: Request, res: Response) => {
        const includeInactive = req.query.includeInactive === 'true';

        const categories = await this.categorySer.getAllCategories(includeInactive);

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories,
        });
    });

    /**
     * GET /api/v1/categories/:id/subcategories
     * Get all subcategories of a parent category
     */
    getSubcategories = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const subcategories = await this.categorySer.getSubcategories(id);

        res.status(200).json({
            success: true,
            message: 'Subcategories retrieved successfully',
            data: subcategories,
        });
    });
}

export const categoryController = new CategoryController(categoryService);
