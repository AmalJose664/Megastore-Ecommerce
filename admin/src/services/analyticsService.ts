import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import { ApiResponse } from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

export interface SalesTrendPoint {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface CategoryRevenueItem {
  categoryId: string;
  categoryName: string;
  revenue: number;
  percentage: number;
}

export interface TopProductItem {
  id: string;
  name: string;
  image: string;
  unitsSold: number;
  revenue: number;
}

export interface AnalyticsData {
  range: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  customerLtv: number;
  salesTrend: SalesTrendPoint[];
  topSellingProducts: TopProductItem[];
  revenueByCategory: CategoryRevenueItem[];
}

class AnalyticsService {
  async getAnalytics(range: string = '7days'): Promise<AnalyticsData | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ApiResponse<AnalyticsData>>(
        `${API_BASE_URL}/dashboard/analytics?range=${range}`
      );

      if (error) {
        console.error('Analytics request error:', error.message);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('Analytics service error:', error);
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();
