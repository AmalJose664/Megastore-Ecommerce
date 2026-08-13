import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import { orderService } from '@/services/orderService';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types';
import { format } from 'date-fns';

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<Order['status']>('pending');

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchOrderDetails();
    } else if (id === 'undefined') {
      setIsLoading(false);
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    const data = await orderService.getOrderById(id!);
    if (data) {
      setOrder(data);
      setStatus(data.status);
    } else {
      toast({
        title: 'Error',
        description: 'Order not found',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    const result = await orderService.updateOrderStatus(order.id || order._id!, newStatus);
    if (result.success) {
      setStatus(newStatus as Order['status']);
      toast({
        title: 'Status updated',
        description: `Order status changed to ${newStatus}`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium">Order not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <PageHeader
        title={order.orderNumber}
        description={`Placed on ${format(new Date(order.createdAt), 'MMMM dd, yyyy HH:mm')}`}
        actions={
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Order Items</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item._id || item.id} className="p-4 flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">₹{item.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-muted/30 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Shipping Address</h2>
            </div>
            <div className="p-6">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
              <p className="text-muted-foreground mt-2">
                {order.shippingAddress.addressLine1}<br />
                {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          </div>

          {/* Additional Notes */}
          {order.notes && (
            <div className="card-elevated">
              <div className="p-6 border-b border-border flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold">Order Notes</h2>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground italic">"{order.notes}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="card-elevated p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Order Status</h2>
            </div>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <StatusBadge status={status} className="w-full justify-center" />
          </div>

          {/* Payment Info */}
          <div className="card-elevated p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Payment</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium uppercase">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="card-elevated p-6 space-y-4">
            <h2 className="font-semibold">Customer</h2>
            <div className="space-y-2">
              <p className="font-medium">{order.customer?.name || order.shippingAddress.fullName}</p>
              <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
              {order.customer?.id && (
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate(`/users/${order.customer.id}`)}>
                  View Customer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
