import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import {
  ProductListResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
  FeaturedProductsQuery,
  NewProductsQuery,
  ApiProduct
} from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

class ProductsService {
  // Build query string from parameters
  private buildQuery(params: ProductQueryParams): string {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'boolean') {
          query.append(key, value.toString());
        } else if (Array.isArray(value)) {
          query.append(key, value.join(','));
        } else {
          query.append(key, value.toString());
        }
      }
    });

    return query.toString() ? `?${query.toString()}` : '';
  }

  // GET /api/products (List Products - Public)
  async getProducts(params: ProductQueryParams = {}): Promise<ProductListResponse | null> {
    try {
      const queryString = this.buildQuery(params);
      const { data, error } = await apiHandler.handleRequest<ProductListResponse>(
        `${API_BASE_URL}/products${queryString}`
      );

      if (error) {
        console.error('Get products error:', error.message);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Get products error:', error);
      return null;
    }
  }

  // GET /api/products/featured (Get Featured Products - Public)
  async getFeaturedProducts(params: FeaturedProductsQuery = {}): Promise<ApiProduct[] | null> {
    try {
      const query = params.limit ? `?limit=${params.limit}` : '';
      const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: ApiProduct[] }>(
        `${API_BASE_URL}/products/featured${query}`
      );

      if (error) {
        console.error('Get featured products error:', error.message);
        return null;
      }

      return data?.success ? data.data : null;
    } catch (error) {
      console.error('Get featured products error:', error);
      return null;
    }
  }

  // GET /api/products/new (Get New Products - Public)
  async getNewProducts(params: NewProductsQuery = {}): Promise<ApiProduct[] | null> {
    try {
      const query = params.limit ? `?limit=${params.limit}` : '';
      const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: ApiProduct[] }>(
        `${API_BASE_URL}/products/new${query}`
      );

      if (error) {
        console.error('Get new products error:', error.message);
        return null;
      }

      return data?.success ? data.data : null;
    } catch (error) {
      console.error('Get new products error:', error);
      return null;
    }
  }

  // GET /api/products/slug/:slug (Get Product by Slug - Public)
  async getProductBySlug(slug: string): Promise<ApiProduct | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ProductResponse>(
        `${API_BASE_URL}/products/slug/${slug}`
      );

      if (error) {
        console.error('Get product by slug error:', error.message);
        return null;
      }

      return data?.success ? data.data : null;
    } catch (error) {
      console.error('Get product by slug error:', error);
      return null;
    }
  }

  // GET /api/products/:id (Get Product by ID - Public)
  async getProductById(id: string): Promise<ApiProduct | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ProductResponse>(
        `${API_BASE_URL}/products/${id}`
      );

      if (error) {
        console.error('Get product by ID error:', error.message);
        return null;
      }

      return data?.success ? data.data : null;
    } catch (error) {
      console.error('Get product by ID error:', error);
      return null;
    }
  }

  // POST /api/products (Create Product - Admin Only)
  async createProduct(productData: CreateProductRequest): Promise<ApiProduct | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ProductResponse>(
        `${API_BASE_URL}/products`,
        {
          method: 'POST',
          body: JSON.stringify(productData),
        }
      );

      if (error) {
        console.error('Create product error:', error.message);
        return null;
      }

      return data?.success ? data.data : null;
    } catch (error) {
      console.error('Create product error:', error);
      return null;
    }
  }

  // PUT /api/products/:id (Update Product - Admin Only)
  async updateProduct(id: string, productData: UpdateProductRequest): Promise<ApiProduct | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ProductResponse>(
        `${API_BASE_URL}/products/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(productData),
        }
      );

      if (error) {
        console.error('Update product error:', error.message);
        return null;
      }

      return data?.success ? data.data : null;
    } catch (error) {
      console.error('Update product error:', error);
      return null;
    }
  }

  // DELETE /api/products/:id (Delete Product - Admin Only)
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { data, error } = await apiHandler.handleRequest<{ success: boolean; message: string }>(
        `${API_BASE_URL}/products/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (error) {
        console.error('Delete product error:', error.message);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Delete product error:', error);
      return false;
    }
  }
}

export const productsService = new ProductsService();