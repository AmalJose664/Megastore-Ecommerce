import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import { DashboardData, ApiResponse } from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

class DashboardService {
    // GET /api/dashboard/admin (Get Admin Dashboard Data)
    async getDashboardStats(): Promise<DashboardData | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<DashboardData>>(
                `${API_BASE_URL}/dashboard/admin`
            );

            if (error) {
                console.error('Get dashboard stats error:', error.message);
                return null;
            }

            return data?.data || null;
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            return null;
        }
    }
}

export const dashboardService = new DashboardService();
