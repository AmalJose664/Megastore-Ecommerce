import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface RecentOrdersTableProps {
  orders: Order[];
}

const statusStyles = {
  pending: 'bg-warning/10 text-warning',
  processing: 'bg-info/10 text-info',
  shipped: 'bg-primary/10 text-primary',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const paymentStyles = {
  pending: 'bg-warning/10 text-warning',
  paid: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  refunded: 'bg-muted text-muted-foreground',
};

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const navigate = useNavigate();

  return (
    <div className="card-elevated overflow-hidden animate-slide-up">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <p className="text-sm text-muted-foreground">Latest customer orders</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
            View All
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="text-left p-4">Order</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Payment</th>
              <th className="text-right p-4">Total</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order._id || order.id || index}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="p-4">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.createdAt}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">
                        {order.shippingAddress?.fullName?.charAt(0) || order.customer?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {order.shippingAddress?.fullName || order.customer?.name || 'Guest'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {order.customer?.email || order.shippingAddress?.city || 'No email provided'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={cn("badge-status capitalize", statusStyles[order.status])}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={cn("badge-status capitalize", paymentStyles[order.paymentStatus])}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-4 text-right font-medium">
                  ₹{order.total.toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/orders/${order._id || order.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
