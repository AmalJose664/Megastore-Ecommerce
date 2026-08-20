import { wishlistRepository, WishlistRepository } from '../repositories/wishlist.repository';
import { productRepository, ProductRepository } from '../repositories/product.repository';
import { ApiError } from '../utils/ApiError';
import { IWishlist } from '../types';

export class WishlistService {
  constructor(
    private wishlistRepo: WishlistRepository = wishlistRepository,
    private productRepo: ProductRepository = productRepository
  ) {}

  async getUserWishlist(userId: string): Promise<IWishlist> {
    let wishlist = await this.wishlistRepo.findByUser(userId);
    if (!wishlist) {
      wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);
    }
    return wishlist;
  }

  async addProductToWishlist(userId: string, productId: string): Promise<IWishlist> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return this.wishlistRepo.addProduct(userId, productId);
  }

  async removeProductFromWishlist(userId: string, productId: string): Promise<IWishlist | null> {
    return this.wishlistRepo.removeProduct(userId, productId);
  }

  async toggleWishlistProduct(userId: string, productId: string): Promise<{ wishlist: IWishlist; added: boolean }> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const exists = await this.wishlistRepo.isInWishlist(userId, productId);
    if (exists) {
      const updatedWishlist = await this.wishlistRepo.removeProduct(userId, productId);
      return { wishlist: updatedWishlist!, added: false };
    } else {
      const updatedWishlist = await this.wishlistRepo.addProduct(userId, productId);
      return { wishlist: updatedWishlist, added: true };
    }
  }

  async checkIsInWishlist(userId: string, productId: string): Promise<boolean> {
    return this.wishlistRepo.isInWishlist(userId, productId);
  }
}

export const wishlistService = new WishlistService();
