import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Filter, ArrowUpDown, Download, CheckSquare, Square, RefreshCw, FileText } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order, OrderQueryParams } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { exportToCSV, exportReportPDF } from '@/utils/exportUtils';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('processing');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Search & Filter & Pagination States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [paymentStatus, setPaymentStatus] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: OrderQueryParams = {
        page,
        limit,
        sort: sortField,
        order: sortOrder,
        search: debouncedSearch || undefined,
        status: status !== 'all' ? status : undefined,
        paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
        paymentMethod: paymentMethod !== 'all' ? paymentMethod : undefined,
      };

      const response = await orderService.getAllOrders(params);
      if (response?.data) {
        setOrders(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
          setTotalItems(response.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sortField, sortOrder, debouncedSearch, status, paymentStatus, paymentMethod, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o._id || o.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);

    const res = await orderService.bulkUpdateOrderStatus(selectedIds, bulkStatus);
    if (res.success) {
      toast({
        title: 'Bulk Update Successful',
        description: `Updated ${res.count || selectedIds.length} orders to ${bulkStatus.toUpperCase()}`,
      });
      setSelectedIds([]);
      fetchOrders();
    } else {
      toast({
        title: 'Bulk Update Failed',
        description: res.error || 'Failed to update selected orders',
        variant: 'destructive',
      });
    }
    setIsBulkUpdating(false);
  };

  // Export Handlers
  const exportOrderColumns = [
    { key: 'orderNumber', label: 'Order Number' },
    { key: 'shippingAddress.fullName', label: 'Customer Name' },
    { key: 'shippingAddress.phone', label: 'Phone' },
    { key: 'status', label: 'Order Status' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'paymentStatus', label: 'Payment Status' },
    { key: 'total', label: 'Total Amount (₹)' },
    { key: 'carrier', label: 'Courier Partner' },
    { key: 'trackingNumber', label: 'Tracking Number' },
    { key: 'createdAt', label: 'Order Date' },
  ];

  const handleExportCSV = (targetData: Order[]) => {
    exportToCSV(targetData, 'Orders_Report', exportOrderColumns);
  };

  const handleExportPDF = (targetData: Order[]) => {
    exportReportPDF('Orders Summary Report', targetData, exportOrderColumns, 'Orders_Report');
  };

  const columns = [
    {
      key: 'select',
      header: () => (
        <button onClick={handleSelectAll} className="p-1 hover:text-primary transition-colors">
          {orders.length > 0 && selectedIds.length === orders.length ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      ),
      render: (order: Order) => {
        const id = order._id || order.id;
        const isChecked = selectedIds.includes(id);
        return (
          <button onClick={() => handleToggleSelect(id)} className="p-1 hover:text-primary transition-colors">
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        );
      },
    },
    {
      key: 'orderNumber',
      header: 'Order',
      render: (order: Order) => (
        <div>
          <Link to={`/orders/${order._id || order.id}`} className="font-mono font-medium text-sm hover:underline">{order.orderNumber}</Link>
          <p className="text-xs text-muted-foreground">
            {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm') : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order: Order) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">
              {order.shippingAddress?.fullName?.charAt(0) || order.customer?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {order.shippingAddress?.fullName || order.customer?.name || 'Customer'}
            </p>
            <p className="text-xs text-muted-foreground">{order.shippingAddress?.city}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (order: Order) => (
        <div>
          <p className="text-sm font-medium uppercase">{order.paymentMethod}</p>
          <StatusBadge status={order.paymentStatus} />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Order Status',
      render: (order: Order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: (order: Order) => (
        <div>
          <p className="font-bold text-sm">₹{order.total.toLocaleString()}</p>
          {order.discount > 0 && (
            <p className="text-[10px] text-green-600 font-medium">
              -₹{order.discount.toLocaleString()} Off
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (order: Order) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/orders/${order._id || order.id}`)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  // Filter controls bar
  const filterControls = (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Order Status Filter */}
      <Select
        value={status}
        onValueChange={(val) => { setStatus(val); setPage(1); }}
      >
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Order Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Payment Status Filter */}
      <Select
        value={paymentStatus}
        onValueChange={(val) => { setPaymentStatus(val); setPage(1); }}
      >
        <SelectTrigger className="w-[150px] h-9 text-xs">
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Options */}
      <Select
        value={`${sortField}-${sortOrder}`}
        onValueChange={(val) => {
          const [field, order] = val.split('-');
          setSortField(field);
          setSortOrder(order as 'asc' | 'desc');
          setPage(1);
        }}
      >
        <SelectTrigger className="w-[150px] h-9 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt-desc">Newest First</SelectItem>
          <SelectItem value="createdAt-asc">Oldest First</SelectItem>
          <SelectItem value="total-desc">Total: High to Low</SelectItem>
          <SelectItem value="total-asc">Total: Low to High</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const selectedOrders = orders.filter((o) => selectedIds.includes(o._id || o.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage customer orders, perform bulk status updates, and export reports"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(orders)}
              className="text-xs font-bold gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportPDF(orders)}
              className="text-xs font-bold gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> PDF Summary
            </Button>
          </div>
        }
      />

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {selectedIds.length} order{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-[140px] h-9 text-xs bg-background">
                <SelectValue placeholder="Target Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              onClick={handleBulkStatusUpdate}
              disabled={isBulkUpdating}
              className="text-xs font-bold uppercase tracking-wider"
            >
              {isBulkUpdating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : null}
              Apply Bulk Status
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(selectedOrders)}
              className="text-xs font-bold"
            >
              Export Selected CSV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      <DataTable
        data={orders}
        columns={columns}
        serverSide={true}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={limit}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order number or customer name..."
        loading={isLoading}
        filterControls={filterControls}
        emptyMessage="No orders found matching your search or filters."
      />
    </div>
  );
}
