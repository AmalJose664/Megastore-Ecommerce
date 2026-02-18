import { Request, Response } from 'express';
import { promoService } from '../services/promo.service';
import { asyncHandler } from '../utils/asyncHandler';

export class PromoController {
    /**
     * GET /api/promo
     * Get promo section content (Public)
     */
    getPromoSection = asyncHandler(async (_req: Request, res: Response) => {
        const result = await promoService.getPromoSection();

        // Disable browser caching completely to avoid 304 stale data
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        console.log(`[PromoController] Public FETCH: Returning promo "${result.promo?.title || 'None'}" with version "${result.version}"`);

        res.status(200).json({
            success: true,
            data: result.promo,
            version: result.version,
            server_time: new Date().toISOString()
        });
    });

    /**
     * GET /api/promo/all
     * Get all promo sections (Admin)
     */
    getAllPromos = asyncHandler(async (_req: Request, res: Response) => {
        const promos = await promoService.getAllPromos();

        // Disable browser caching completely
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.status(200).json({
            success: true,
            data: promos,
            audit: {
                count: promos.length,
                active: promos.filter(p => p.isActive).map(p => p.title)
            }
        });
    });

    /**
     * POST /api/promo
     * Create a new promo section (Admin)
     */
    createPromo = asyncHandler(async (req: Request, res: Response) => {
        const promo = await promoService.createPromo(req.body);
        res.status(201).json({
            success: true,
            message: 'Promo section created successfully',
            data: promo
        });
    });

    /**
     * PUT /api/promo/:id
     * Update promo section (Admin)
     */
    updatePromo = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const promo = await promoService.updatePromo(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Promo section updated successfully',
            data: promo
        });
    });

    /**
     * DELETE /api/promo/:id
     * Delete promo section (Admin)
     */
    deletePromo = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await promoService.deletePromo(id);
        res.status(200).json({
            success: true,
            message: 'Promo section deleted successfully'
        });
    });

    /**
     * PATCH /api/promo/:id/activate
     * Activate a promo section (Admin)
     */
    activatePromo = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        console.log(`[PromoController] Received activation request for ID: "${id}"`);

        const promo = await promoService.activatePromo(id);

        console.log(`[PromoController] Successfully processed activation for: "${promo.title}" (${promo._id})`);

        res.status(200).json({
            success: true,
            message: 'Promo section activated successfully',
            data: promo
        });
    });

    /**
     * PATCH /api/promo/:id/deactivate
     * Deactivate a promo section (Admin)
     */
    deactivatePromo = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const promo = await promoService.deactivatePromo(id);
        res.status(200).json({
            success: true,
            message: 'Promo section deactivated successfully',
            data: promo
        });
    });
}

export const promoController = new PromoController();
