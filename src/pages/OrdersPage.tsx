import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, Search, Filter } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    const data = await orderService.getAllOrders();
    if (data) {
      setOrders(data);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order',
      render: (order: Order) => (
        <div>
          <p className="font-mono font-medium text-sm">{order.orderNumber}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
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
              {order.shippingAddress?.fullName || order.customer?.name}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage customer orders and shipments"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      <DataTable
        data={orders}
        columns={columns}
        rowKey="_id"
        searchKey="orderNumber"
        searchPlaceholder="Search order number..."
        emptyMessage={isLoading ? "Loading orders..." : "No orders found"}
      />
    </div>
  );
}
