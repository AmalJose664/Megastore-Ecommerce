import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Category } from '../models';
import { ICategory } from '../types';

export interface CategoryFilters {
  search?: string;
  level?: 'all' | 'root' | 'subcategory';
  status?: 'all' | 'active' | 'inactive';
  parentCategory?: string;
}

export class CategoryRepository extends BaseRepository<ICategory> {
    constructor() {
        super(Category);
    }

    async findWithFilters(
      filters: CategoryFilters,
      page: number,
      limit: number,
      sort: string = 'displayOrder',
      order: 'asc' | 'desc' = 'asc'
    ): Promise<{ categories: ICategory[]; total: number }> {
      const query: FilterQuery<ICategory> = {};

      if (filters.status === 'active') {
        query.isActive = true;
      } else if (filters.status === 'inactive') {
        query.isActive = false;
      }

      if (filters.level === 'root') {
        query.parentCategory = null;
      } else if (filters.level === 'subcategory') {
        query.parentCategory = { $ne: null };
      } else if (filters.parentCategory) {
        query.parentCategory = filters.parentCategory === 'root' ? null : (filters.parentCategory as any);
      }

      if (filters.search) {
        const regex = { $regex: filters.search, $options: 'i' };
        query.$or = [{ name: regex }, { slug: regex }, { description: regex }];
      }

      const skip = (page - 1) * limit;
      const sortOption: any = { [sort]: order === 'asc' ? 1 : -1 };

      const [categories, total] = await Promise.all([
        this.model.find(query).sort(sortOption).skip(skip).limit(limit),
        this.model.countDocuments(query),
      ]);

      return { categories, total };
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
                    tree.push(node);
                }
            } else {
                tree.push(node);
            }
        });

        return tree;
    }

    /**
     * Find category by slug
     */
    async findBySlug(slug: string): Promise<ICategory | null> {
        return this.model.findOne({ slug, isActive: true }).exec();
    }

    /**
     * Find subcategories by parent category ID
     */
    async findSubcategories(parentCategoryId: string): Promise<ICategory[]> {
        return this.model
            .find({
                parentCategory: new Types.ObjectId(parentCategoryId),
                isActive: true,
            })
            .sort({ displayOrder: 1 })
            .exec();
    }

    /**
     * Check if category has subcategories
     */
    async hasSubcategories(categoryId: string): Promise<boolean> {
        const count = await this.model
            .countDocuments({
                parentCategory: new Types.ObjectId(categoryId),
                isActive: true,
            })
            .exec();

        return count > 0;
    }

    /**
     * Check if slug exists (excluding given category ID if provided)
     */
    async slugExists(slug: string, excludeCategoryId?: string): Promise<boolean> {
        const query: any = { slug };

        if (excludeCategoryId) {
            query._id = { $ne: new Types.ObjectId(excludeCategoryId) };
        }

        const count = await this.model.countDocuments(query).exec();
        return count > 0;
    }
}

export const categoryRepository = new CategoryRepository();
