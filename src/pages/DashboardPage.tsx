import React from 'react';
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-react';
import { mockDashboardStats, mockOrders, mockProducts, mockActivityLog } from '@/data/mockData';
import StatCard from '@/components/dashboard/StatCard';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import LowStockAlert from '@/components/dashboard/LowStockAlert';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import PageHeader from '@/components/ui/PageHeader';

export default function DashboardPage() {
  const stats = mockDashboardStats;

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
          value={`$${stats.totalRevenue.toLocaleString()}`}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - 2 columns */}
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={mockOrders} />
        </div>

        {/* Right Column - Alerts & Activity */}
        <div className="space-y-6">
          <LowStockAlert products={mockProducts} />
          <ActivityFeed activities={mockActivityLog} />
        </div>
      </div>
    </div>
  );
}
