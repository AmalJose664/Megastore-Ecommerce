import { Request, Response } from 'express';
import { bannerService } from '../services/banner.service';
import { asyncHandler } from '../utils/asyncHandler';

export class BannerController {


    /**
     * GET /api/banners
     * Get all banners (Admin)
     */
    getAllBanners = asyncHandler(async (_req: Request, res: Response) => {
        const banners = await bannerService.getAllBanners();
        res.status(200).json({
            success: true,
            data: banners
        });
    });

    /**
     * POST /api/banners
     * Create a new banner/section content (Admin)
     */
    createBanner = asyncHandler(async (req: Request, res: Response) => {
        const banner = await bannerService.createBanner(req.body);
        res.status(201).json({
            success: true,
            message: 'Banner/Section content created successfully',
            data: banner
        });
    });

    /**
     * PUT /api/banners/:id
     * Update banner/section content (Admin)
     */
    updateBanner = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const banner = await bannerService.updateBanner(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Banner/Section content updated successfully',
            data: banner
        });
    });

    /**
     * DELETE /api/banners/:id
     * Delete banner/section content (Admin)
     */
    deleteBanner = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await bannerService.deleteBanner(id);
        res.status(200).json({
            success: true,
            message: 'Banner/Section content deleted successfully'
        });
    });
}

export const bannerController = new BannerController();
