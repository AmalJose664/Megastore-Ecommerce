import React, { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardData } from '@/types';
import StatCard from '@/components/dashboard/StatCard';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import LowStockAlert from '@/components/dashboard/LowStockAlert';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import SalesChart from '@/components/dashboard/SalesChart';
import PageHeader from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const data = await dashboardService.getDashboardStats();
      if (data) {
        setDashboardData(data);
      }
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Loading your store overview..."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[450px] rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-[200px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-lg">Failed to load dashboard data.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentOrders, lowStockProducts, activityLog, charts } = dashboardData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your store."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={stats.ordersChange}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueChange}
          icon={DollarSign}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          change={stats.productsChange}
          icon={Package}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.usersChange}
          icon={Users}
        />
      </div>

      {/* Charts & Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart & Table */}
        <div className="lg:col-span-2 space-y-6">
          <SalesChart data={charts.salesOverTime} />
          <RecentOrdersTable orders={recentOrders} />
        </div>

        {/* Right Column - Alerts & Activity */}
        <div className="space-y-6">
          <LowStockAlert products={lowStockProducts} />
          <ActivityFeed activities={activityLog} />
        </div>
      </div>
    </div>
  );
}
