import { BaseRepository } from './base.repository';
import { Cart } from '../models';
import { ICart } from '../types';
import { Types } from 'mongoose';

const getProductIdString = (prod: any): string => {
  if (!prod) return '';
  if (typeof prod === 'string') return prod;
  if (prod._id) return prod._id.toString();
  if (prod.id) return prod.id.toString();
  return prod.toString();
};

export class CartRepository extends BaseRepository<ICart> {
  constructor() {
    super(Cart);
  }

  async findByUser(userId: string): Promise<ICart | null> {
    return this.model.findOne({ user: userId }).populate('items.product', 'name price images inStock stock');
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    price: number,
    variantId?: string,
    selectedVariant?: any
  ): Promise<ICart> {
    let cart = await this.findByUser(userId);

    const newItem = {
      product: new Types.ObjectId(productId),
      quantity,
      price,
      variantId,
      selectedVariant,
    };

    if (!cart) {
      cart = await this.model.create({
        user: userId,
        items: [newItem],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          getProductIdString(item.product) === productId &&
          (variantId ? item.variantId === variantId : !item.variantId)
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push(newItem as any);
      }

      await cart.save();
    }

    return cart.populate('items.product', 'name price images inStock stock');
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<ICart | null> {
    const cart = await this.findByUser(userId);
    if (!cart) return null;

    const itemIndex = cart.items.findIndex((item) => getProductIdString(item.product) === productId);
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

    cart.items = cart.items.filter((item) => getProductIdString(item.product) !== productId);
    await cart.save();

    return cart.populate('items.product', 'name price images inStock stock');
  }

  async getOrCreateCart(userId: string): Promise<ICart> {
    let cart = await this.findByUser(userId);

    if (!cart) {
      const userObjectId = new Types.ObjectId(userId);
      cart = await this.model.create({ user: userObjectId, items: [] });
    }

    return cart;
  }

  async mergeCartItems(
    userId: string,
    itemsToMerge: Array<{ productId: string; quantity: number; price: number }>
  ): Promise<ICart> {
    let cart = await this.findByUser(userId);

    if (!cart) {
      const userObjectId = new Types.ObjectId(userId);
      cart = await this.model.create({
        user: userObjectId,
        items: itemsToMerge.map((item) => ({
          product: new Types.ObjectId(item.productId),
          quantity: item.quantity,
          price: item.price,
        })),
      });
    } else {
      itemsToMerge.forEach((item) => {
        const existingIndex = cart!.items.findIndex(
          (ci) => getProductIdString(ci.product) === item.productId
        );

        if (existingIndex > -1) {
          cart!.items[existingIndex].quantity += item.quantity;
        } else {
          cart!.items.push({
            product: new Types.ObjectId(item.productId),
            quantity: item.quantity,
            price: item.price,
          });
        }
      });

      await cart.save();
    }

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