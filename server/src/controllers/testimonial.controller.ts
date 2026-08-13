import { Request, Response } from 'express';
import { testimonialService } from '../services/testimonial.service';
import { asyncHandler } from '../utils/asyncHandler';

export class TestimonialController {
    /**
     * GET /api/testimonials
     * Get approved testimonials (Public)
     */
    getTestimonials = asyncHandler(async (req: Request, res: Response) => {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const testimonials = await testimonialService.getApprovedTestimonials(limit);
        res.status(200).json({
            success: true,
            data: testimonials,
        });
    });

    /**
     * POST /api/testimonials
     * Create a new testimonial (Admin)
     */
    createTestimonial = asyncHandler(async (req: Request, res: Response) => {
        const testimonial = await testimonialService.createTestimonial(req.body);
        res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            data: testimonial,
        });
    });

    /**
     * PUT /api/testimonials/:id
     * Update a testimonial (Admin)
     */
    updateTestimonial = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const testimonial = await testimonialService.updateTestimonial(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Testimonial updated successfully',
            data: testimonial,
        });
    });

    /**
     * DELETE /api/testimonials/:id
     * Delete a testimonial (Admin)
     */
    deleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await testimonialService.deleteTestimonial(id);
        res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully',
        });
    });
}

export const testimonialController = new TestimonialController();
