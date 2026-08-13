import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { asyncHandler } from '../utils/asyncHandler';
import { UserRole } from '../types';

export class ReviewController {
    /**
     * POST /api/reviews
     * Add a new review
     */
    addReview = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const review = await reviewService.addReview(userId, req.body);

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully. It will be visible after approval.',
            data: review,
        });
    });

    /**
     * GET /api/reviews/product/:productId
     * Get all approved reviews for a product
     */
    getProductReviews = asyncHandler(async (req: Request, res: Response) => {
        const { productId } = req.params;
        const reviews = await reviewService.getProductReviews(productId);

        res.status(200).json({
            success: true,
            data: reviews,
        });
    });

    /**
     * GET /api/reviews/my-reviews
     * Get reviews submitted by the logged-in user
     */
    getUserReviews = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const reviews = await reviewService.getUserReviews(userId);

        res.status(200).json({
            success: true,
            data: reviews,
        });
    });

    /**
     * PATCH /api/reviews/:id
     * Update a review
     */
    updateReview = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const { id } = req.params;
        const review = await reviewService.updateReview(id, userId, req.body);

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: review,
        });
    });

    /**
     * DELETE /api/reviews/:id
     * Delete a review
     */
    deleteReview = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const isAdmin = req.user!.role === UserRole.ADMIN;
        const { id } = req.params;

        await reviewService.deleteReview(id, userId, isAdmin);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });
    });

    /**
     * PATCH /api/reviews/:id/approve
     * Approve a review (Admin only)
     */
    approveReview = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const review = await reviewService.approveReview(id);

        res.status(200).json({
            success: true,
            message: 'Review approved successfully',
            data: review,
        });
    });
}

export const reviewController = new ReviewController();
