import { cartRepository, productRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { ICart } from '../types';
import { Types } from 'mongoose';

export class CartService {
  async getCart(userId: string): Promise<ICart> {
    let cart = await cartRepository.findByUser(userId);

    if (!cart) {
      const userObjectId = new Types.ObjectId(userId);
      cart = await cartRepository.create({ user: userObjectId, items: [] });
    }

    return cart;
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<ICart> {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (!product.inStock || product.stock < quantity) {
      throw ApiError.badRequest('Product is out of stock or insufficient quantity');
    }

    if (quantity <= 0) {
      throw ApiError.badRequest('Quantity must be greater than 0');
    }

    return cartRepository.addItem(userId, productId, quantity, product.price);
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<ICart> {
    if (quantity < 0) {
      throw ApiError.badRequest('Quantity cannot be negative');
    }

    if (quantity > 0) {
      const product = await productRepository.findById(productId);
      if (!product) {
        throw ApiError.notFound('Product not found');
      }

      if (product.stock < quantity) {
        throw ApiError.badRequest('Insufficient stock available');
      }
    }

    const cart = await cartRepository.updateItemQuantity(userId, productId, quantity);

    if (!cart) {
      throw ApiError.notFound('Cart or item not found');
    }

    return cart;
  }

  async removeFromCart(userId: string, productId: string): Promise<ICart> {
    const cart = await cartRepository.removeItem(userId, productId);

    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    await cartRepository.clearCart(userId);
  }
}

export const cartService = new CartService();