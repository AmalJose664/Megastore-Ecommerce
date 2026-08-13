import { Request, Response } from 'express';
import { activityService } from '../services/activity.service';
import { asyncHandler } from '../utils/asyncHandler';

export class ActivityController {
    getRecentActivities = asyncHandler(async (req: Request, res: Response) => {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const activities = await activityService.getRecentActivities(limit);

        res.json({
            success: true,
            data: activities,
        });
    });
}

export const activityController = new ActivityController();
