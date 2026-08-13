import { cartRepository, productRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { ICart } from '../types';

export class CartService {
  async getCart(userId: string): Promise<ICart> {
    return cartRepository.getOrCreateCart(userId);
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

  async mergeCart(
    userId: string,
    guestItems: Array<{ productId: string; quantity: number }>
  ): Promise<ICart> {
    if (!guestItems || guestItems.length === 0) {
      return this.getCart(userId);
    }

    const itemsToMerge: Array<{ productId: string; quantity: number; price: number }> = [];

    for (const item of guestItems) {
      if (!item.productId || !item.quantity || item.quantity <= 0) continue;
      const product = await productRepository.findById(item.productId);
      if (product && product.inStock) {
        itemsToMerge.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }
    }

    if (itemsToMerge.length === 0) {
      return this.getCart(userId);
    }

    return cartRepository.mergeCartItems(userId, itemsToMerge);
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