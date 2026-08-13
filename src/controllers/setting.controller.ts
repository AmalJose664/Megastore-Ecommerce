import { Request, Response } from 'express';
import { settingService } from '../services/setting.service';
import { asyncHandler } from '../utils/asyncHandler';

export class SettingController {
  getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingService.getSettings();
    res.status(200).json({
      success: true,
      data: settings,
    });
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingService.updateSettings(req.body);
    res.status(200).json({
      success: true,
      message: 'Site settings updated successfully',
      data: settings,
    });
  });
}

export const settingController = new SettingController();
