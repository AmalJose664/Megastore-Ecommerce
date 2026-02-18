import { productRepository, ProductFilters } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { ProductDocument } from '../models';
import { PaginatedResponse } from '../types';
import { buildPaginatedResponse } from '../utils/pagination';

export class ProductService {
  async createProduct(data: Partial<ProductDocument>): Promise<ProductDocument> {
    // Sanitize subcategory
    const sub = data.subcategory as any;
    if (sub === 'none' || sub === '' || sub === 'null' || sub === '0' || sub === 0) {
      data.subcategory = undefined;
    }

    const existingSku = await productRepository.findBySku(data.sku!);
    if (existingSku) {
      throw ApiError.conflict('Product with this SKU already exists');
    }

    return productRepository.create(data);
  }

  async getProductById(id: string): Promise<ProductDocument> {
    const product = await productRepository.findById(id);
    if (!product || !product.isActive) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }

  async getProductBySlug(slug: string): Promise<ProductDocument> {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }

  async getProducts(
    filters: ProductFilters,
    page: number,
    limit: number,
    sort: string,
    order: 'asc' | 'desc'
  ): Promise<PaginatedResponse<ProductDocument>> {
    const { products, total } = await productRepository.findWithFilters(
      filters,
      page,
      limit,
      sort,
      order
    );

    return buildPaginatedResponse(products, total, page, limit);
  }

  async updateProduct(id: string, data: Partial<ProductDocument>): Promise<ProductDocument> {
    // Sanitize subcategory
    const sub = data.subcategory as any;
    if (sub === 'none' || sub === '' || sub === 'null' || sub === '0' || sub === 0) {
      data.subcategory = undefined;
    }

    if (data.sku) {
      const existingSku = await productRepository.findBySku(data.sku);
      if (existingSku && existingSku._id.toString() !== id) {
        throw ApiError.conflict('Product with this SKU already exists');
      }
    }

    const product = await productRepository.updateById(id, data);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    // Soft delete
    const product = await productRepository.updateById(id, { isActive: false });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
  }

  async getFeaturedProducts(limit: number = 10): Promise<ProductDocument[]> {
    return productRepository.getFeaturedProducts(limit);
  }

  async getNewProducts(limit: number = 10): Promise<ProductDocument[]> {
    return productRepository.getNewProducts(limit);
  }

  async updateStock(productId: string, quantity: number, _userId: string): Promise<ProductDocument> {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const updatedProduct = await productRepository.updateStock(productId, quantity);
    if (!updatedProduct) {
      throw ApiError.internal('Failed to update stock');
    }

    // Log inventory change (implement InventoryLog creation here if needed)

    return updatedProduct;
  }

  async getLowStockProducts(threshold?: number): Promise<ProductDocument[]> {
    return productRepository.getLowStockProducts(threshold);
  }
}

export const productService = new ProductService();