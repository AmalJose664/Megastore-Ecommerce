import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Award,
  Calendar,
  Download,
  FileText,
  PieChart,
  BarChart3,
  Layers,
} from 'lucide-react';
import { analyticsService, AnalyticsData } from '@/services/analyticsService';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportReportPDF } from '@/utils/exportUtils';

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [range, setRange] = useState<string>('7days');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getAnalytics(range);
      if (res) {
        setData(res);
      } else {
        toast({ title: 'Error', description: 'Failed to load sales analytics data', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  }, [range, toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportCSV = () => {
    if (!data) return;
    exportToCSV(data.topSellingProducts, 'Top_Selling_Products', [
      { key: 'name', label: 'Product Name' },
      { key: 'unitsSold', label: 'Units Sold' },
      { key: 'revenue', label: 'Total Revenue (₹)' },
    ]);
  };

  const handleExportPDF = () => {
    if (!data) return;
    exportReportPDF('Sales Analytics Executive Report', data.topSellingProducts, [
      { key: 'name', label: 'Product Name' },
      { key: 'unitsSold', label: 'Units Sold' },
      { key: 'revenue', label: 'Revenue (₹)' },
    ], 'Sales_Analytics_Report');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const maxCategoryRevenue = Math.max(...(data?.revenueByCategory.map((c) => c.revenue) || [1]));
  const maxDailyRevenue = Math.max(...(data?.salesTrend.map((s) => s.revenue) || [1]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics & Reports"
        description="Comprehensive insights into revenue, top-selling products, category distribution, and customer metrics"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs font-bold gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="text-xs font-bold gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Executive PDF
            </Button>
          </div>
        }
      />

      {/* Date Range Selector Bar */}
      <div className="bg-card border border-border rounded-2xl p-2 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground pl-3">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Time Horizon</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                range === item.id
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                  : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-elevated border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold font-display text-foreground">
              ₹{(data?.totalRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Gross sales earned
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold font-display text-foreground">
              {data?.totalOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed & processed orders</p>
          </CardContent>
        </Card>

        <Card className="card-elevated border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Avg Order Value (AOV)
            </CardTitle>
            <BarChart3 className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold font-display text-foreground">
              ₹{(data?.avgOrderValue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average spent per order</p>
          </CardContent>
        </Card>

        <Card className="card-elevated border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Customer LTV
            </CardTitle>
            <Users className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold font-display text-foreground">
              ₹{(data?.customerLtv || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Avg revenue per registered user</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart */}
        <Card className="lg:col-span-2 card-elevated">
          <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Sales Trend Over Time
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Daily revenue distribution in selected period</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!data?.salesTrend || data.salesTrend.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                No sales data recorded for this period.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-56 flex items-end gap-3 pt-6 px-2 border-b border-border/60">
                  {data.salesTrend.map((point, idx) => {
                    const heightPercent = maxDailyRevenue > 0 ? Math.max(8, (point.revenue / maxDailyRevenue) * 100) : 8;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] font-bold py-1 px-2.5 rounded-md shadow-lg border border-border z-20 pointer-events-none whitespace-nowrap">
                          ₹{point.revenue.toLocaleString()} ({point.ordersCount} orders)
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[36px] bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all duration-300 shadow-sm"
                        />
                        <span className="text-[10px] font-bold text-muted-foreground truncate w-full text-center">
                          {point.date.split('-').slice(1).join('/')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Category Progress Cards */}
        <Card className="card-elevated">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {!data?.revenueByCategory || data.revenueByCategory.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                No category sales recorded yet.
              </div>
            ) : (
              data.revenueByCategory.map((cat, idx) => {
                const widthPercent = maxCategoryRevenue > 0 ? Math.max(5, (cat.revenue / maxCategoryRevenue) * 100) : 5;
                return (
                  <div key={cat.categoryId || idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground capitalize">{cat.categoryName}</span>
                      <span className="text-primary font-bold">₹{cat.revenue.toLocaleString()} ({cat.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className="h-full bg-primary rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products Table */}
      <Card className="card-elevated">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Top Selling Products
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Products ordered most frequently by customers</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.topSellingProducts || data.topSellingProducts.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No top-selling products found for this time period.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.topSellingProducts.map((product, idx) => (
                <div key={product.id || idx} className="p-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                    <img
                      src={product.image || 'https://via.placeholder.com/100'}
                      alt={product.name}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold text-xs">{product.name}</p>
                      <p className="text-[11px] text-muted-foreground">{product.unitsSold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-foreground">₹{product.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Top Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
