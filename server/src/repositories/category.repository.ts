import { BaseRepository } from './base.repository';
import { Category } from '../models';
import { ICategory } from '../types';
import { Types } from 'mongoose';

export class CategoryRepository extends BaseRepository<ICategory> {
    constructor() {
        super(Category);
    }

    /**
     * Find all active categories and return as tree structure
     */
    async findCategoryTree(): Promise<ICategory[]> {
        const categories = await this.model
            .find({ isActive: true })
            .sort({ displayOrder: 1 })
            .exec();

        return this.buildTree(categories);
    }

    /**
     * Build nested tree structure from flat array
     */
    private buildTree(categories: any[]): any[] {
        const categoryMap = new Map();
        const tree: any[] = [];

        // First pass: create a map of all categories
        categories.forEach((category) => {
            categoryMap.set(category._id.toString(), {
                ...(category.toJSON ? category.toJSON() : category),
                children: [],
            });
        });

        // Second pass: build the tree structure
        categories.forEach((category) => {
            const categoryId = category._id.toString();
            const node = categoryMap.get(categoryId);

            if (category.parentCategory) {
                const parentId = category.parentCategory.toString();
                const parent = categoryMap.get(parentId);

                if (parent) {
                    parent.children.push(node);
                } else {
                    // If parent not found, treat as root level
                    tree.push(node);
                }
            } else {
                // Top-level category
                tree.push(node);
            }
        });

        return tree;
    }

    /**
     * Find category by slug
     */
    async findBySlug(slug: string): Promise<ICategory | null> {
        return await this.model
            .findOne({ slug, isActive: true })
            .populate('parentCategory', 'name slug')
            .exec();
    }

    /**
     * Find all subcategories of a parent
     */
    async findSubcategories(parentId: string): Promise<ICategory[]> {
        if (!Types.ObjectId.isValid(parentId)) {
            return [];
        }

        return await this.model
            .find({ parentCategory: parentId, isActive: true })
            .sort({ displayOrder: 1 })
            .exec();
    }

    /**
     * Check if category has subcategories
     */
    async hasSubcategories(categoryId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(categoryId)) {
            return false;
        }

        const count = await this.model.countDocuments({
            parentCategory: categoryId,
            isActive: true,
        });
        return count > 0;
    }

    /**
     * Check if slug already exists
     */
    async slugExists(slug: string, excludeId?: string): Promise<boolean> {
        const query: any = { slug };

        if (excludeId && Types.ObjectId.isValid(excludeId)) {
            query._id = { $ne: excludeId };
        }

        const count = await this.model.countDocuments(query);
        return count > 0;
    }

    /**
     * Soft delete category
     */
    async softDelete(id: string): Promise<ICategory | null> {
        return this.updateById(id, { isActive: false });
    }
}

export const categoryRepository = new CategoryRepository();
