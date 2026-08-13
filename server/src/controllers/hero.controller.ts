import { Request, Response } from 'express';
import { heroService } from '../services/hero.service';
import { asyncHandler } from '../utils/asyncHandler';

export class HeroController {
    /**
     * GET /api/hero
     * Get hero section content (Public)
     */
    getHeroSection = asyncHandler(async (_req: Request, res: Response) => {
        const data = await heroService.getHeroSection();
        res.status(200).json({
            success: true,
            data
        });
    });

    /**
     * GET /api/hero/all
     * Get all hero sections (Admin)
     */
    getAllHeroes = asyncHandler(async (_req: Request, res: Response) => {
        const heroes = await heroService.getAllHeroes();
        res.status(200).json({
            success: true,
            data: heroes
        });
    });

    /**
     * POST /api/hero
     * Create a new hero section (Admin)
     */
    createHero = asyncHandler(async (req: Request, res: Response) => {
        const hero = await heroService.createHero(req.body);
        res.status(201).json({
            success: true,
            message: 'Hero section created successfully',
            data: hero
        });
    });

    /**
     * PUT /api/hero/:id
     * Update hero section (Admin)
     */
    updateHero = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const hero = await heroService.updateHero(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Hero section updated successfully',
            data: hero
        });
    });

    /**
     * DELETE /api/hero/:id
     * Delete hero section (Admin)
     */
    deleteHero = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await heroService.deleteHero(id);
        res.status(200).json({
            success: true,
            message: 'Hero section deleted successfully'
        });
    });

    /**
     * PATCH /api/hero/:id/activate
     * Activate a hero section (Admin)
     */
    activateHero = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const hero = await heroService.activateHero(id);
        res.status(200).json({
            success: true,
            message: 'Hero section activated successfully',
            data: hero
        });
    });

    /**
     * PATCH /api/hero/:id/deactivate
     * Deactivate a hero section (Admin)
     */
    deactivateHero = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const hero = await heroService.deactivateHero(id);
        res.status(200).json({
            success: true,
            message: 'Hero section deactivated successfully',
            data: hero
        });
    });
}

export const heroController = new HeroController();
