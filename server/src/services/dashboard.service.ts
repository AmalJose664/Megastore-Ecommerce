import {
    orderRepository,
    productRepository,
    userRepository,
    activityRepository
} from '../repositories';
import { AdminDashboardData, IDashboardStats } from '../types';

export class DashboardService {
    async getAdminDashboardData(): Promise<AdminDashboardData> {
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // 1. Fetch Stats (Current Month so far vs Previous Month total)
        const [
            currentMonthRevenue,
            prevMonthRevenue,
            totalRevenue,
            currentMonthOrders,
            prevMonthOrders,
            totalOrders,
            currentMonthProducts,
            prevMonthProducts,
            totalProducts,
            currentMonthUsers,
            prevMonthUsers,
            totalUsers,
        ] = await Promise.all([
            orderRepository.getMonthlyRevenue(firstDayCurrentMonth, now),
            orderRepository.getMonthlyRevenue(firstDayPrevMonth, lastDayPrevMonth),
            orderRepository.getMonthlyRevenue(new Date(0), now),
            orderRepository.countInRange(firstDayCurrentMonth, now),
            orderRepository.countInRange(firstDayPrevMonth, lastDayPrevMonth),
            orderRepository.countDocuments({}),
            productRepository.countInRange(firstDayCurrentMonth, now),
            productRepository.countInRange(firstDayPrevMonth, lastDayPrevMonth),
            productRepository.countDocuments({}),
            userRepository.countInRange(firstDayCurrentMonth, now),
            userRepository.countInRange(firstDayPrevMonth, lastDayPrevMonth),
            userRepository.countDocuments({}),
        ]);

        const stats: IDashboardStats = {
            totalRevenue,
            revenueChange: this.calculatePercentageChange(currentMonthRevenue, prevMonthRevenue),
            totalOrders,
            ordersChange: this.calculatePercentageChange(currentMonthOrders, prevMonthOrders),
            totalProducts,
            productsChange: this.calculatePercentageChange(currentMonthProducts, prevMonthProducts),
            totalUsers,
            usersChange: this.calculatePercentageChange(currentMonthUsers, prevMonthUsers),
        };

        // 2. Fetch Recent Data
        const [recentOrders, lowStockProducts, activityLog, dailySales] = await Promise.all([
            orderRepository.findMany({}, { limit: 10, sort: { createdAt: -1 }, populate: { path: 'user', select: 'firstName lastName email' } }),
            productRepository.getLowStockProducts(10), // Threshold of 10
            activityRepository.getRecentActivities(10),
            orderRepository.getDailySales(7),
        ]);

        return {
            stats,
            recentOrders: recentOrders as any,
            lowStockProducts,
            activityLog: activityLog as any,
            charts: {
                salesOverTime: dailySales,
            },
        };
    }

    private calculatePercentageChange(current: number, previous: number): number {
        if (previous === 0) return current > 0 ? 100 : 0;
        const change = ((current - previous) / previous) * 100;
        return Math.round(change * 10) / 10; // Round to 1 decimal
    }
}

export const dashboardService = new DashboardService();
