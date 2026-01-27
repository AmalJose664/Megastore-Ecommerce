import { BaseRepository } from './base.repository';
import { Cart } from '../models';
import { ICart } from '../types';
import { Types } from 'mongoose';

export class CartRepository extends BaseRepository<ICart> {
  constructor() {
    super(Cart);
  }

  async findByUser(userId: string): Promise<ICart | null> {
    return this.model.findOne({ user: userId }).populate('items.product', 'name price images inStock stock');
  }

  async addItem(userId: string, productId: string, quantity: number, price: number): Promise<ICart> {
    let cart = await this.findByUser(userId);

    if (!cart) {
      cart = await this.model.create({
        user: userId,
        items: [{ product: productId, quantity, price }],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: new Types.ObjectId(productId), quantity, price });
      }

      await cart.save();
    }

    return cart.populate('items.product', 'name price images inStock stock');
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<ICart | null> {
    const cart = await this.findByUser(userId);
    if (!cart) return null;

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) return null;

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return cart.populate('items.product', 'name price images inStock stock');
  }

  async removeItem(userId: string, productId: string): Promise<ICart | null> {
    const cart = await this.findByUser(userId);
    if (!cart) return null;

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    return cart.populate('items.product', 'name price images inStock stock');
  }

  async clearCart(userId: string): Promise<ICart | null> {
    return this.model.findOneAndUpdate(
      { user: userId },
      { items: [], totalItems: 0, subtotal: 0 },
      { new: true }
    );
  }
}

export const cartRepository = new CartRepository();