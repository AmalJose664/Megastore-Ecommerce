import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MoreVertical, UserCheck, UserX, Filter, Download, FileText } from 'lucide-react';
import { userService } from '@/services/userService';
import { User } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportReportPDF } from '@/utils/exportUtils';

export default function UsersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Minimal Filter & Search States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers({
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, roleFilter, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const userExportColumns = [
    { key: 'name', label: 'User Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Account Status' },
    { key: 'ordersCount', label: 'Total Orders' },
    { key: 'totalSpent', label: 'Total Spent (₹)' },
    { key: 'createdAt', label: 'Joined Date' },
  ];

  const handleExportCSV = () => {
    exportToCSV(users, 'Customers_Report', userExportColumns);
  };

  const handleExportPDF = () => {
    exportReportPDF('Customer Database Report', users, userExportColumns, 'Customers_Report');
  };

  const toggleUserStatus = async (user: User) => {
    const isCurrentlyActive = user.status === 'active';
    const newIsActive = !isCurrentlyActive;

    const result = await userService.toggleUserStatus(user.id || (user as any)._id, newIsActive);

    if (result.success) {
      toast({
        title: `User ${newIsActive ? 'activated' : 'deactivated'}`,
        description: `${user.name} has been ${newIsActive ? 'activated' : 'deactivated'}.`,
      });
      fetchUsers();
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
        <span className="font-medium">₹{(user.totalSpent || 0).toFixed(2)}</span>
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

  // Filter controls bar
  const filterControls = (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Status Filter */}
      <Select
        value={statusFilter}
        onValueChange={(val) => setStatusFilter(val)}
      >
        <SelectTrigger className="w-[130px] h-9 text-xs">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Role Filter */}
      <Select
        value={roleFilter}
        onValueChange={(val) => setRoleFilter(val)}
      >
        <SelectTrigger className="w-[130px] h-9 text-xs">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="customer">Customer</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage customer accounts with search, filters, and export"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs font-bold gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="text-xs font-bold gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> PDF Summary
            </Button>
          </div>
        }
      />

      <DataTable
        data={users}
        columns={columns}
        serverSide={true}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name or email..."
        loading={loading}
        filterControls={filterControls}
        emptyMessage="No users found matching your search or filters"
      />
    </div>
  );
}
