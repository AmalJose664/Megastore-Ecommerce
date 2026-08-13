import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MoreVertical, UserCheck, UserX, Loader2 } from 'lucide-react';
import { userService } from '@/services/userService';
import { User } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await userService.getUsers();
    if (data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (user: User) => {
    const isCurrentlyActive = user.status === 'active';
    const newIsActive = !isCurrentlyActive;

    const result = await userService.toggleUserStatus(user.id || (user as any)._id, newIsActive);

    if (result.success) {
      const newStatus = newIsActive ? 'active' : 'inactive';
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if ((u.id || (u as any)._id) === (user.id || (user as any)._id)) {
            return { ...u, status: newStatus };
          }
          return u;
        })
      );
      toast({
        title: `User ${newIsActive ? 'activated' : 'deactivated'}`,
        description: `${user.name} has been ${newIsActive ? 'activated' : 'deactivated'}.`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => <StatusBadge status={user.status} />,
    },
    {
      key: 'orders',
      header: 'Orders',
      render: (user: User) => (
        <span className="text-sm">{user.ordersCount || 0} orders</span>
      ),
    },
    {
      key: 'spent',
      header: 'Total Spent',
      render: (user: User) => (
        <span className="font-medium">${(user.totalSpent || 0).toFixed(2)}</span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (user: User) => {
        let joinedDate = 'N/A';
        if (user.createdAt) {
          try {
            joinedDate = new Date(user.createdAt).toLocaleDateString();
          } catch {
            joinedDate = String(user.createdAt);
          }
        }
        return <span className="text-sm text-muted-foreground">{joinedDate}</span>;
      },
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize bg-secondary text-secondary-foreground">
          {user.role}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (user: User) => {
        const userId = user.id || (user as any)._id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/users/${userId}`)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                {user.status === 'active' ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage customer accounts" />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search users..."
          emptyMessage="No users found"
        />
      )}
    </div>
  );
}
