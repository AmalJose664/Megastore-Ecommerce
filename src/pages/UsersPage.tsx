import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MoreVertical, UserCheck, UserX } from 'lucide-react';
import { mockUsers } from '@/data/mockData';
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
  const [users, setUsers] = useState(mockUsers);

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        toast({
          title: `User ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
          description: `${user.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
        });
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
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
        <span className="text-sm">{user.ordersCount} orders</span>
      ),
    },
    {
      key: 'spent',
      header: 'Total Spent',
      render: (user: User) => (
        <span className="font-medium">${user.totalSpent.toFixed(2)}</span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (user: User) => (
        <span className="text-sm text-muted-foreground">{user.createdAt}</span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (user: User) => (
        <span className="text-sm text-muted-foreground">{user.lastLogin || 'Never'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage customer accounts"
      />

      <DataTable
        data={users}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search users..."
        emptyMessage="No users found"
      />
    </div>
  );
}
