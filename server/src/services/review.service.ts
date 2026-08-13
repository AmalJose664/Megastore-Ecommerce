import { reviewRepository } from '../repositories/review.repository';
import { productRepository } from '../repositories/product.repository';
import { ApiError } from '../utils/ApiError';
import { IReview } from '../types';

export class ReviewService {
    async addReview(userId: string, data: Partial<IReview>): Promise<IReview> {
        const { product: productId } = data;

        if (!productId) {
            throw ApiError.badRequest('Product ID is required');
        }

        // Check if user already reviewed this product
        const existingReview = await reviewRepository.findByProductAndUser(productId.toString(), userId);
        if (existingReview) {
            throw ApiError.conflict('You have already reviewed this product');
        }

        const review = await reviewRepository.create({
            ...data,
            user: userId as any,
        });

        // Update product rating if the review is approved immediately (or we could wait for approval)
        // For now, let's assume we might need to update if it's auto-approved or later.
        if (review.isApproved) {
            await this.updateProductStats(productId.toString());
        }

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
