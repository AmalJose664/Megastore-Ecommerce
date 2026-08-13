import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import {
    Category,
    CategoryNode,
    CategoryDetails,
    ApiResponse
} from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

class CategoriesService {
    // GET /api/v1/categories (Get Category Tree)
    async getCategories(): Promise<CategoryNode[] | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<CategoryNode[]>>(
                `${API_BASE_URL}/categories`
            );

            if (error) {
                console.error('Get categories tree error:', error.message);
                return null;
            }

            return data?.success ? data.data : null;
        } catch (error) {
            console.error('Get categories tree error:', error);
            return null;
        }
    }

    // GET /api/v1/categories/:slug (Get Category by Slug)
    async getCategoryBySlug(slug: string): Promise<CategoryDetails | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<CategoryDetails>>(
                `${API_BASE_URL}/categories/${slug}`
            );

            if (error) {
                console.error('Get category by slug error:', error.message);
                return null;
            }

            return data?.success ? data.data : null;
        } catch (error) {
            console.error('Get category by slug error:', error);
            return null;
        }
    }

    // POST /api/v1/categories (Create Category/Subcategory)
    async createCategory(categoryData: {
        name: string;
        description: string;
        image?: string;
        parentCategory?: string | null;
        displayOrder?: number;
    }): Promise<Category | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<Category>>(
                `${API_BASE_URL}/categories`,
                {
                    method: 'POST',
                    body: JSON.stringify(categoryData),
                }
            );

            if (error) {
                console.error('Create category error:', error.message);
                return null;
            }

            return data?.success ? data.data : null;
        } catch (error) {
            console.error('Create category error:', error);
            return null;
        }
    }

    // PUT /api/v1/categories/:id (Update Category)
    async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<Category>>(
                `${API_BASE_URL}/categories/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(categoryData),
                }
            );

            if (error) {
                console.error('Update category error:', error.message);
                return null;
            }

            return data?.success ? data.data : null;
        } catch (error) {
            console.error('Update category error:', error);
            return null;
        }
    }

    // DELETE /api/v1/categories/:id (Delete Category)
    async deleteCategory(id: string): Promise<boolean> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse>(
                `${API_BASE_URL}/categories/${id}`,
                {
                    method: 'DELETE',
                }
            );

            if (error) {
                console.error('Delete category error:', error.message);
                return false;
            }

            return data?.success || false;
        } catch (error) {
            console.error('Delete category error:', error);
            return false;
        }
    }
}

export const categoriesService = new CategoriesService();
