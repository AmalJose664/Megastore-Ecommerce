import { BaseRepository } from './base.repository';
import { Wishlist } from '../models';
import { IWishlist } from '../types';
import { Types } from 'mongoose';

export class WishlistRepository extends BaseRepository<IWishlist> {
  constructor() {
    super(Wishlist);
  }

  async findByUser(userId: string): Promise<IWishlist | null> {
    return this.model
      .findOne({ user: userId })
      .populate({
        path: 'products',
        select: 'name slug price originalPrice images thumbnail inStock stock rating reviewCount category isActive',
        populate: { path: 'category', select: 'name slug' },
      })
      .exec();
  }

  async getOrCreateWishlist(userId: string): Promise<IWishlist> {
    let wishlist = await this.model.findOne({ user: userId }).exec();
    if (!wishlist) {
      wishlist = await this.model.create({ user: userId, products: [] });
    }
    return wishlist;
  }

  async addProduct(userId: string, productId: string): Promise<IWishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);
    const prodObjId = new Types.ObjectId(productId);

    const exists = wishlist.products.some((id) => id.toString() === productId);
    if (!exists) {
      wishlist.products.push(prodObjId as any);
      await wishlist.save();
    }

    return this.findByUser(userId) as Promise<IWishlist>;
  }

  async removeProduct(userId: string, productId: string): Promise<IWishlist | null> {
    const wishlist = await this.model.findOne({ user: userId }).exec();
    if (!wishlist) return null;

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    return this.findByUser(userId);
  }

  async clearWishlist(userId: string): Promise<IWishlist | null> {
    return this.model.findOneAndUpdate(
      { user: userId },
      { products: [] },
      { new: true }
    );
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await this.model.findOne({ user: userId }).exec();
    if (!wishlist) return false;
    return wishlist.products.some((id) => id.toString() === productId);
  }
}

export const wishlistRepository = new WishlistRepository();
