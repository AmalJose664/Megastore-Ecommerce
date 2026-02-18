import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download } from 'lucide-react';
import { mockOrders } from '@/data/mockData';
import { Order } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function OrdersPage() {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order',
      render: (order: Order) => (
        <div>
          <p className="font-medium">{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">{order.createdAt}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order: Order) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {order.customer.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{order.customer.name}</p>
            <p className="text-xs text-muted-foreground">{order.customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (order: Order) => (
        <span className="text-sm">{order.items.length} items</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (order: Order) => <StatusBadge status={order.paymentStatus} />,
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: (order: Order) => (
        <span className="font-medium">${order.total.toFixed(2)}</span>
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
          onClick={() => navigate(`/orders/${order.id}`)}
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
        description="Manage customer orders"
        actions={
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        }
      />

      <DataTable
        data={mockOrders}
        columns={columns}
        searchKey="orderNumber"
        searchPlaceholder="Search orders..."
        emptyMessage="No orders found"
      />
    </div>
  );
}
