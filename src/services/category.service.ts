import { categoryRepository, CategoryRepository } from '../repositories/category.repository';
import slugify from 'slugify';
import { ICategory } from '../types';
import { ApiError } from '../utils/ApiError';

interface CreateCategoryDTO {
    name: string;
    description?: string;
    image?: string;
    parentCategory?: string;
    displayOrder?: number;
}

interface UpdateCategoryDTO {
    name?: string;
    description?: string;
    image?: string;
    parentCategory?: string;
    displayOrder?: number;
    isActive?: boolean;
}

export class CategoryService {
    constructor(private categoryRepo: CategoryRepository) { }

    /**
     * Get all categories in tree structure
     */
    async getCategoryTree(): Promise<ICategory[]> {
        return await this.categoryRepo.findCategoryTree();
    }

    /**
     * Get category by slug with subcategories
     */
    async getCategoryBySlug(slug: string): Promise<any> {
        const category = await this.categoryRepo.findBySlug(slug);

        if (!category) {
            throw ApiError.notFound('Category not found');
        }

        // Get subcategories if it's a parent category
        const subcategories = await this.categoryRepo.findSubcategories(
            category._id.toString()
        );

        return {
            ...category,
            subcategories,
        };
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: string): Promise<ICategory> {
        const category = await this.categoryRepo.findById(id);

        if (!category) {
            throw ApiError.notFound('Category not found');
        }

        return category;
    }

    /**
     * Create a new category or subcategory
     */
    async createCategory(data: CreateCategoryDTO): Promise<ICategory> {
        // Validate parent category if provided
        if (data.parentCategory) {
            const parentExists = await this.categoryRepo.exists({ _id: data.parentCategory });

            if (!parentExists) {
                throw ApiError.notFound('Parent category not found');
            }
        }

        // Generate slug from name
        const slug = this.generateSlug(data.name);

        // Check if slug already exists
        const slugExists = await this.categoryRepo.slugExists(slug);
        if (slugExists) {
            throw ApiError.conflict('A category with this name already exists');
        }

        // Prepare category data
        const categoryData: Partial<ICategory> = {
            name: data.name,
            slug,
            description: data.description,
            image: data.image,
            parentCategory: data.parentCategory ? (data.parentCategory as any) : null,
            displayOrder: data.displayOrder || 0,
            isActive: true,
        };

        return await this.categoryRepo.create(categoryData as any);
    }

    /**
     * Update category
     */
    async updateCategory(id: string, data: UpdateCategoryDTO): Promise<ICategory> {
        // Check if category exists
        const existingCategory = await this.categoryRepo.findById(id);

        if (!existingCategory) {
            throw ApiError.notFound('Category not found');
        }

        // Validate parent category if provided and changed
        if (data.parentCategory) {
            // Prevent self-referencing
            if (data.parentCategory === id) {
                throw ApiError.badRequest('Category cannot be its own parent');
            }

            // Prevent circular references
            await this.validateNoCircularReference(id, data.parentCategory);

            const parentExists = await this.categoryRepo.exists({ _id: data.parentCategory });

            if (!parentExists) {
                throw ApiError.notFound('Parent category not found');
            }
        }

        // If name is being updated, generate new slug
        let updateData: any = { ...data };

        if (data.name && data.name !== existingCategory.name) {
            const newSlug = this.generateSlug(data.name);

            // Check if new slug already exists (excluding current category)
            const slugExists = await this.categoryRepo.slugExists(newSlug, id);

            if (slugExists) {
                throw ApiError.conflict('A category with this name already exists');
            }

            updateData.slug = newSlug;
        }

        const updatedCategory = await this.categoryRepo.updateById(id, updateData);

        if (!updatedCategory) {
            throw ApiError.internal('Failed to update category');
        }

        return updatedCategory;
    }

    /**
     * Soft delete category
     */
    async deleteCategory(id: string): Promise<void> {
        // Check if category exists
        const category = await this.categoryRepo.findById(id);

        if (!category) {
            throw ApiError.notFound('Category not found');
        }

        // Check if category has active subcategories
        const hasSubcategories = await this.categoryRepo.hasSubcategories(id);

        if (hasSubcategories) {
            throw ApiError.badRequest(
                'Cannot delete category with active subcategories. Please delete or reassign subcategories first.'
            );
        }

        // Perform soft delete
        await this.categoryRepo.softDelete(id);
    }

    /**
     * Get all categories (flat list) - Admin use
     */
    async getAllCategories(includeInactive: boolean = false): Promise<ICategory[]> {
        const filter = includeInactive ? {} : { isActive: true };
        return await this.categoryRepo.findMany(filter);
    }

    /**
     * Get subcategories of a parent
     */
    async getSubcategories(parentId: string): Promise<ICategory[]> {
        const parentExists = await this.categoryRepo.exists({ _id: parentId });

        if (!parentExists) {
            throw ApiError.notFound('Parent category not found');
        }

        return await this.categoryRepo.findSubcategories(parentId);
    }

    /**
     * Generate slug from name
     */
    private generateSlug(name: string): string {
        return slugify(name, {
            lower: true,
            strict: true,
            trim: true,
        });
    }

    /**
     * Validate no circular reference in category hierarchy
     */
    private async validateNoCircularReference(
        categoryId: string,
        newParentId: string
    ): Promise<void> {
        let currentParentId = newParentId;
        const visited = new Set<string>();

        while (currentParentId) {
            // If we've seen this ID before, there's a cycle
            if (visited.has(currentParentId)) {
                throw ApiError.badRequest('Circular reference detected in category hierarchy');
            }

            // If the parent is the category itself, that's a cycle
            if (currentParentId === categoryId) {
                throw ApiError.badRequest(
                    'Circular reference detected: category cannot be a descendant of itself'
                );
            }

            visited.add(currentParentId);

            // Get the parent category
            const parent = await this.categoryRepo.findById(currentParentId);

            if (!parent) {
                break;
            }

            // Move up the hierarchy
            currentParentId = parent.parentCategory?.toString() || '';
        }
    }
}

export const categoryService = new CategoryService(categoryRepository);
