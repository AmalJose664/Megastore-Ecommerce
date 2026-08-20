import { reviewRepository } from '../repositories/review.repository';
import { productRepository } from '../repositories/product.repository';
import { orderRepository } from '../repositories/order.repository';
import { ApiError } from '../utils/ApiError';
import { IReview, OrderStatus } from '../types';

export class ReviewService {
    async canUserReviewProduct(userId: string, productId: string): Promise<{ canReview: boolean; reason?: string }> {
        const existingReview = await reviewRepository.findByProductAndUser(productId, userId);
        if (existingReview) {
            return { canReview: false, reason: 'You have already reviewed this product' };
        }

        const userOrders = await orderRepository.findAllByUserId(userId);
        const hasPurchased = userOrders.some(order => 
            (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.PAID) &&
            order.items.some(item => item.product?.toString() === productId)
        );

        if (!hasPurchased) {
            return { canReview: false, reason: 'Only verified buyers who completed a purchase can review this product.' };
        }

        return { canReview: true };
    }

    async addReview(userId: string, data: Partial<IReview>): Promise<IReview> {
        const { product: productId } = data;

        if (!productId) {
            throw ApiError.badRequest('Product ID is required');
        }

        const check = await this.canUserReviewProduct(userId, productId.toString());
        if (!check.canReview) {
            throw ApiError.forbidden(check.reason || 'Cannot review product');
        }

        const review = await reviewRepository.create({
            ...data,
            user: userId as any,
            isVerifiedPurchase: true,
            isApproved: true,
        });

        await this.updateProductStats(productId.toString());

        return review;
    }

    async getProductReviews(productId: string): Promise<IReview[]> {
        return reviewRepository.findByProduct(productId);
    }

    async getUserReviews(userId: string): Promise<IReview[]> {
        return reviewRepository.findByUser(userId);
    }

    async updateReview(reviewId: string, userId: string, data: Partial<IReview>): Promise<IReview> {
        const review = await reviewRepository.findById(reviewId);

        if (!review) {
            throw ApiError.notFound('Review not found');
        }

        if (review.user.toString() !== userId) {
            throw ApiError.unauthorized('You can only update your own reviews');
        }

        const updatedReview = await reviewRepository.updateById(reviewId, data);
        if (!updatedReview) {
            throw ApiError.internal('Failed to update review');
        }

        if (updatedReview.isApproved) {
            await this.updateProductStats(updatedReview.product.toString());
        }

        return updatedReview;
    }

    async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false): Promise<void> {
        const review = await reviewRepository.findById(reviewId);

        if (!review) {
            throw ApiError.notFound('Review not found');
        }

        if (!isAdmin && review.user.toString() !== userId) {
            throw ApiError.unauthorized('You can only delete your own reviews');
        }

        const productId = review.product.toString();
        await reviewRepository.deleteById(reviewId);

        if (review.isApproved) {
            await this.updateProductStats(productId);
        }
    }

    async approveReview(reviewId: string): Promise<IReview> {
        const review = await reviewRepository.updateById(reviewId, { isApproved: true });
        if (!review) {
            throw ApiError.notFound('Review not found');
        }

        await this.updateProductStats(review.product.toString());

        return review;
    }

    private async updateProductStats(productId: string): Promise<void> {
        const { averageRating, reviewCount } = await reviewRepository.calculateAverageRating(productId);
        await productRepository.updateRating(productId, averageRating, reviewCount);
    }
}

export const reviewService = new ReviewService();
