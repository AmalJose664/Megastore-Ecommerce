import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, ShoppingBag, UserCheck, UserX } from 'lucide-react';
import { mockUsers, mockOrders } from '@/data/mockData';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const user = mockUsers.find(u => u.id === id);
  const [status, setStatus] = useState(user?.status || 'active');
  
  // Get user's orders
  const userOrders = mockOrders.filter(o => o.customer.id === id);

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

  const toggleStatus = () => {
    const newStatus = status === 'active' ? 'inactive' : 'active';
    setStatus(newStatus);
    toast({
      title: `User ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      description: `${user.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
    });
  };

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
        <div className="card-elevated p-6 text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-4">
            <StatusBadge status={status} />
          </div>
          <Button
            variant="outline"
            className="w-full mt-6"
            onClick={toggleStatus}
          >
            {status === 'active' ? (
              <>
                <UserX className="w-4 h-4 mr-2" />
                Deactivate User
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Activate User
              </>
            )}
          </Button>
        </div>

        {/* User Stats & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-elevated p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.ordersCount}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </div>
            <div className="card-elevated p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <span className="text-success text-lg font-bold">$</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">${user.totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-semibold">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Joined {user.createdAt}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Last login: {user.lastLogin || 'Never'}</span>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold">Order History</h3>
            </div>
            {userOrders.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
