import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, ShoppingBag, UserCheck, UserX, Loader2 } from 'lucide-react';
import { userService } from '@/services/userService';
import { User, Order } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchUserData = async () => {
      setLoading(true);
      const res = await userService.getUserById(id);
      if (res) {
        setUser(res.user);
        setOrders(res.orders || []);
      }
      setLoading(false);
    };
    fetchUserData();
  }, [id]);

  const toggleStatus = async () => {
    if (!user || !id) return;
    const currentActive = user.status === 'active';
    const newActive = !currentActive;

    const result = await userService.toggleUserStatus(id, newActive);
    if (result.success) {
      const newStatus = newActive ? 'active' : 'inactive';
      setUser({ ...user, status: newStatus });
      toast({
        title: `User ${newActive ? 'activated' : 'deactivated'}`,
        description: `${user.name} has been ${newActive ? 'activated' : 'deactivated'}.`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium">User not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const formattedJoinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : 'N/A';

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="User Details"
        actions={
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile */}
        <div className="card-elevated p-5 text-center">
          <Avatar className="w-16 h-16 mx-auto mb-3">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-base font-semibold">{user.name || 'User'}</h2>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-3">
            <StatusBadge status={user.status} />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 text-xs h-8"
            onClick={toggleStatus}
          >
            {user.status === 'active' ? (
              <>
                <UserX className="w-3.5 h-3.5 mr-1.5" />
                Deactivate User
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                Activate User
              </>
            )}
          </Button>
        </div>

        {/* User Stats & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-elevated p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{user.ordersCount || orders.length}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </div>
            <div className="card-elevated p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-success/10">
                  <span className="text-success text-base font-bold">₹</span>
                </div>
                <div>
                  <p className="text-lg font-bold">₹{(user.totalSpent || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="card-elevated p-4 space-y-3">
            <h3 className="font-semibold text-xs">Account Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs">{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs">Joined {formattedJoinedDate}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize bg-secondary text-secondary-foreground">
                  Role: {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="card-elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-xs">Order History</h3>
            </div>
            {orders.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                {orders.map((order) => {
                  const orderId = order.id || (order as any)._id;
                  const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : 'N/A';
                  return (
                    <div
                      key={orderId}
                      className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/orders/${orderId}`)}
                    >
                      <div>
                        <p className="font-semibold text-xs">{order.orderNumber || `Order #${orderId.slice(-6)}`}</p>
                        <p className="text-[11px] text-muted-foreground">{orderDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-xs">₹{(order.total || 0).toLocaleString()}</p>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
