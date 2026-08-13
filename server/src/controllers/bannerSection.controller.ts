import { Request, Response } from 'express';
import { bannerSectionService } from '../services/bannerSection.service';
import { asyncHandler } from '../utils/asyncHandler';

export class BannerSectionController {
  getActiveSections = asyncHandler(async (_req: Request, res: Response) => {
    const sections = await bannerSectionService.getActiveBannerSections();
    res.status(200).json({
      success: true,
      data: sections,
    });
  });

  getAllSections = asyncHandler(async (_req: Request, res: Response) => {
    const sections = await bannerSectionService.getAllBannerSections();
    res.status(200).json({
      success: true,
      data: sections,
    });
  });

  getSectionById = asyncHandler(async (req: Request, res: Response) => {
    const section = await bannerSectionService.getBannerSectionById(req.params.id);
    res.status(200).json({
      success: true,
      data: section,
    });
  });

  createSection = asyncHandler(async (req: Request, res: Response) => {
    const section = await bannerSectionService.createBannerSection(req.body);
    res.status(201).json({
      success: true,
      message: 'Banner section created successfully',
      data: section,
    });
  });

  updateSection = asyncHandler(async (req: Request, res: Response) => {
    const section = await bannerSectionService.updateBannerSection(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Banner section updated successfully',
      data: section,
    });
  });

  deleteSection = asyncHandler(async (req: Request, res: Response) => {
    await bannerSectionService.deleteBannerSection(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Banner section deleted successfully',
    });
  });
}

export const bannerSectionController = new BannerSectionController();
