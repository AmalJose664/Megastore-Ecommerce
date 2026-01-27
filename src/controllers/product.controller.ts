import { Request, Response } from 'express';
import { productService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { ProductFilters } from '../repositories';

export class ProductController {
  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  });

  getProducts = asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
    } = parsePagination(req.query);

    const filters: ProductFilters = {
      category: req.query.category as string,
      subcategory: req.query.subcategory as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      featured: req.query.featured === 'true',
      isNew: req.query.isNew === 'true',
      inStock: req.query.inStock === 'true',
      search: req.query.search as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    };

    const result = await productService.getProducts(filters, page, limit, sort!, order!);

    res.json(result);
  });

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductById(req.params.id);

    res.json({
      success: true,
      data: product,
    });
  });

  getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductBySlug(req.params.slug);

    res.json({
      success: true,
      data: product,
    });
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  });

  getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const products = await productService.getFeaturedProducts(limit);

    res.json({
      success: true,
      data: products,
    });
  });

  getNewProducts = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const products = await productService.getNewProducts(limit);

    res.json({
      success: true,
      data: products,
    });
  });
}

export const productController = new ProductController();