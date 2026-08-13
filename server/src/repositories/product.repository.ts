import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { ProductModel, ProductDocument } from '../models';

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  featured?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  search?: string;
  tags?: string[];
}

export class ProductRepository extends BaseRepository<ProductDocument> {
  constructor() {
    super(ProductModel);
  }

  async findById(id: string | Types.ObjectId): Promise<ProductDocument | null> {
    return this.model.findById(id).populate('category subcategory');
  }

  async findBySlug(slug: string): Promise<ProductDocument | null> {
    return this.model.findOne({ slug, isActive: true }).populate('category subcategory');
  }

  async findBySku(sku: string): Promise<ProductDocument | null> {
    return this.model.findOne({ sku: sku.toUpperCase() }).populate('category subcategory');
  }

  async findWithFilters(
    filters: ProductFilters,
    page: number,
    limit: number,
    sort: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ products: ProductDocument[]; total: number }> {
    const query: FilterQuery<ProductDocument> = { isActive: true };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.subcategory) {
      query.subcategory = filters.subcategory;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }

    if (filters.minRating !== undefined) {
      query.rating = { $gte: filters.minRating };
    }

    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }

    if (filters.isNew !== undefined) {
      query.isNewProduct = filters.isNew;
    }

    if (filters.inStock !== undefined) {
      query.inStock = filters.inStock;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const skip = (page - 1) * limit;
    const sortOption: any = { [sort]: order === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      this.model
        .find(query)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(query),
    ]);

    return { products, total };
  }

  async updateStock(productId: string, quantity: number): Promise<ProductDocument | null> {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantity } },
      { new: true }
    ).populate('category subcategory');
  }

  async updateRating(productId: string, rating: number, reviewCount: number): Promise<ProductDocument | null> {
    return this.model.findByIdAndUpdate(
      productId,
      { rating, reviewCount },
      { new: true }
    ).populate('category subcategory');
  }

  async getFeaturedProducts(limit: number = 10): Promise<ProductDocument[]> {
    return this.model
      .find({ featured: true, isActive: true, inStock: true })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async getNewProducts(limit: number = 10): Promise<ProductDocument[]> {
    return this.model
      .find({ isNewProduct: true, isActive: true, inStock: true })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async getLowStockProducts(threshold?: number): Promise<ProductDocument[]> {
    return this.model
      .find({
        $expr: { $lte: ['$stock', threshold || '$lowStockThreshold'] },
        isActive: true,
      })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ stock: 1 });
  }
}

export const productRepository = new ProductRepository();