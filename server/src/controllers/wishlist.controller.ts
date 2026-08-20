import { Request, Response } from 'express';
import { wishlistService, WishlistService } from '../services/wishlist.service';
import { asyncHandler } from '../utils/asyncHandler';

export class WishlistController {
  constructor(private wishlistSer: WishlistService = wishlistService) {}

  getWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id?.toString() || req.user!.userId;
    const wishlist = await this.wishlistSer.getUserWishlist(userId);

    res.json({
      success: true,
      data: wishlist,
    });
  });

  addToWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id?.toString() || req.user!.userId;
    const { productId } = req.body;

    const wishlist = await this.wishlistSer.addProductToWishlist(userId, productId);

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist,
    });
  });

  removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id?.toString() || req.user!.userId;
    const { productId } = req.params;

    const wishlist = await this.wishlistSer.removeProductFromWishlist(userId, productId);

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist,
    });
  });

  toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id?.toString() || req.user!.userId;
    const { productId } = req.body;

    const result = await this.wishlistSer.toggleWishlistProduct(userId, productId);

    res.json({
      success: true,
      message: result.added ? 'Product added to wishlist' : 'Product removed from wishlist',
      data: result.wishlist,
      added: result.added,
    });
  });

  checkIsInWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id?.toString() || req.user!.userId;
    const { productId } = req.params;

    const inWishlist = await this.wishlistSer.checkIsInWishlist(userId, productId);

    res.json({
      success: true,
      data: { inWishlist },
    });
  });
}

export const wishlistController = new WishlistController();
