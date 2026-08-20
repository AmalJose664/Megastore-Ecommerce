import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';

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

    const filters = {
      category: req.query.category as string,
      subcategory: req.query.subcategory as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
      featured: req.query.featured !== undefined ? req.query.featured === 'true' : undefined,
      isNew: req.query.isNew !== undefined ? req.query.isNew === 'true' : undefined,
      inStock: req.query.inStock !== undefined ? req.query.inStock === 'true' : undefined,
      stockStatus: req.query.stockStatus as any,
      status: req.query.status as any,
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

  bulkDeleteProducts = asyncHandler(async (req: Request, res: Response) => {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ success: false, message: 'productIds array is required' });
      return;
    }

    const deletedIds: string[] = [];
    for (const id of productIds) {
      try {
        await productService.deleteProduct(id);
        deletedIds.push(id);
      } catch (err: any) {
        console.warn(`Failed to delete product ${id}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Successfully deleted ${deletedIds.length} products`,
      data: { deletedIds },
    });
  });

  getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 8;
    const products = await productService.getFeaturedProducts(limit);
    res.json({
      success: true,
      data: products,
    });
  });

  getNewProducts = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 8;
    const products = await productService.getNewProducts(limit);
    res.json({
      success: true,
      data: products,
    });
  });

  getSearchSuggestions = asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q as string) || (req.query.search as string) || '';
    const limit = req.query.limit ? Number(req.query.limit) : 6;
    const products = await productService.getSearchSuggestions(q, limit);
    res.json({
      success: true,
      data: products,
    });
  });
}

export const productController = new ProductController();
