import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';

export class DashboardController {
    getAdminDashboard = asyncHandler(async (_req: Request, res: Response) => {
        const data = await dashboardService.getAdminDashboardData();

        res.json({
            success: true,
            data,
        });
    });
}

export const dashboardController = new DashboardController();
