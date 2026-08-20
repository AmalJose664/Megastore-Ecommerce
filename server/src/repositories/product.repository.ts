import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { ProductModel, Category, ProductDocument } from '../models';

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  featured?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  status?: 'all' | 'active' | 'archived';
  search?: string;
  tags?: string[];
  isActive?: boolean;
}

export class ProductRepository extends BaseRepository<ProductDocument> {
  constructor() {
    super(ProductModel);
  }

  async create(data: Partial<ProductDocument>): Promise<ProductDocument> {
    const created = await this.model.create(data);
    const populated = await this.model.findById(created._id).populate('category subcategory');
    return populated!;
  }

  async updateById(id: string | Types.ObjectId, update: any): Promise<ProductDocument | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate('category subcategory');
  }

  async findById(id: string | Types.ObjectId): Promise<ProductDocument | null> {
    return this.model.findById(id).populate('category subcategory');
  }

  async findBySlug(slug: string): Promise<ProductDocument | null> {
    return this.model.findOne({ slug, isActive: true }).populate('category subcategory');
  }

  async getSuggestions(searchQuery: string, limit: number = 6): Promise<ProductDocument[]> {
    if (!searchQuery || !searchQuery.trim()) return [];
    const regex = { $regex: searchQuery.trim(), $options: 'i' };
    return this.model
      .find({
        isActive: true,
        $or: [{ name: regex }, { sku: regex }],
      })
      .select('name slug price thumbnail images category')
      .populate('category', 'name slug')
      .limit(limit);
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
    const query: FilterQuery<ProductDocument> = {};

    if (filters.status === 'active') {
      query.isActive = true;
    } else if (filters.status === 'archived') {
      query.isActive = false;
    } else if (filters.status === 'all') {
      delete query.isActive;
    } else if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.stockStatus === 'in_stock') {
      query.stock = { $gt: 0 };
    } else if (filters.stockStatus === 'low_stock') {
      query.$expr = { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] };
    } else if (filters.stockStatus === 'out_of_stock') {
      query.stock = 0;
    } else if (filters.inStock !== undefined) {
      query.inStock = filters.inStock;
    }

    if (filters.category && filters.category !== 'all') {
      if (Types.ObjectId.isValid(filters.category)) {
        query.category = filters.category;
      } else {
        const catDocs = await Category.find({
          $or: [
            { slug: filters.category.toLowerCase() },
            { name: { $regex: new RegExp(`^${filters.category}$`, 'i') } },
            { name: { $regex: filters.category, $options: 'i' } }
          ]
        }).select('_id');

        if (catDocs.length > 0) {
          query.category = { $in: catDocs.map((c: any) => c._id) };
        } else {
          const regex = new RegExp(filters.category, 'i');
          query.$or = [
            { name: regex },
            { description: regex },
            { tags: regex }
          ];
        }
      }
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

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { sku: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
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