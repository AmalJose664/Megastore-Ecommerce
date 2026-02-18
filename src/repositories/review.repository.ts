import { BaseRepository } from './base.repository';
import { Review } from '../models';
import { IReview } from '../types';
import { Types } from 'mongoose';

export class ReviewRepository extends BaseRepository<IReview> {
    constructor() {
        super(Review);
    }

    async findByProduct(productId: string): Promise<IReview[]> {
        return this.model
            .find({ product: productId, isApproved: true })
            .populate('user', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findByUser(userId: string): Promise<IReview[]> {
        return this.model
            .find({ user: userId })
            .populate('product', 'name slug images')
            .sort({ createdAt: -1 })
            .exec();
    }

    async calculateAverageRating(productId: string): Promise<{ averageRating: number; reviewCount: number }> {
        const stats = await this.model.aggregate([
            { $match: { product: new Types.ObjectId(productId), isApproved: true } },
            {
                $group: {
                    _id: '$product',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 },
                },
            },
        ]);

        if (stats.length === 0) {
            return { averageRating: 0, reviewCount: 0 };
        }

        return {
            averageRating: Math.round(stats[0].averageRating * 10) / 10,
            reviewCount: stats[0].reviewCount,
        };
    }

    async findByProductAndUser(productId: string, userId: string): Promise<IReview | null> {
        return this.model.findOne({ product: productId, user: userId }).exec();
    }
}

export const reviewRepository = new ReviewRepository();
