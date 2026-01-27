import { Request, Response } from 'express';
import { cartService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';

export class CartController {
  getCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.getCart(req.user!.userId);

    res.json({
      success: true,
      data: cart,
    });
  });

  addToCart = asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user!.userId, productId, quantity);

    res.json({
      success: true,
      message: 'Product added to cart',
      data: cart,
    });
  });

  updateCartItem = asyncHandler(async (req: Request, res: Response) => {
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(
      req.user!.userId,
      req.params.productId,
      quantity
    );

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: cart,
    });
  });

  removeFromCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.removeFromCart(req.user!.userId, req.params.productId);

    res.json({
      success: true,
      message: 'Product removed from cart',
      data: cart,
    });
  });

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    await cartService.clearCart(req.user!.userId);

    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  });
}

export const cartController = new CartController();