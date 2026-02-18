import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Ticket, Eye, EyeOff, Users, UserCheck } from 'lucide-react';
import { Coupon, CreateCouponRequest } from '@/types';
import { couponService } from '@/services/couponService';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { CouponForm } from '@/components/coupons/CouponForm';
import { format } from 'date-fns';

export default function CouponsPage() {
    const { toast } = useToast();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
    const [deleteCoupon, setDeleteCoupon] = useState<Coupon | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const initialFormData: CreateCouponRequest = {
        code: '',
        description: '',
        discountType: 'fixed',
        discountValue: 0,
        minPurchaseAmount: 0,
        validFrom: format(new Date(), 'yyyy-MM-dd'),
        validUntil: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        usageLimit: 100,
        isListed: true,
        isReusable: false,
        isActive: true,
    };

    const [formData, setFormData] = useState<CreateCouponRequest>(initialFormData);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setIsLoading(true);
        const data = await couponService.getCoupons();
        if (data) {
            setCoupons(data);
        }
        setIsLoading(false);
    };

    const resetForm = () => {
        setFormData(initialFormData);
    };

    const openCreate = () => {
        resetForm();
        setIsCreateOpen(true);
    };

    const openEdit = (coupon: Coupon) => {
        setEditCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minPurchaseAmount: coupon.minPurchaseAmount,
            validFrom: coupon.validFrom.split('T')[0],
            validUntil: coupon.validUntil.split('T')[0],
            usageLimit: coupon.usageLimit,
            isListed: coupon.isListed,
            isReusable: coupon.isReusable,
            isActive: coupon.isActive,
        });
    };

    const handleSave = async () => {
        if (!formData.code.trim()) {
            toast({
                title: 'Error',
                description: 'Coupon code is required',
                variant: 'destructive',
            });
            return;
        }

        if (editCoupon) {
            const result = await couponService.updateCoupon(editCoupon._id, formData);
            if (result.success) {
                toast({ title: 'Coupon updated', description: `Coupon "${formData.code}" has been updated.` });
                setEditCoupon(null);
                fetchCoupons();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to update coupon',
                    variant: 'destructive'
                });
            }
        } else {
            const result = await couponService.createCoupon(formData);
            if (result.success) {
                toast({ title: 'Coupon created', description: `Coupon "${formData.code}" has been created.` });
                setIsCreateOpen(false);
                fetchCoupons();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to create coupon',
                    variant: 'destructive'
                });
            }
        }
    };

    const handleDelete = async () => {
        if (deleteCoupon) {
            const result = await couponService.deleteCoupon(deleteCoupon._id);
            if (result.success) {
                toast({ title: 'Coupon deleted', description: `Coupon "${deleteCoupon.code}" has been deleted.` });
                fetchCoupons();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to delete coupon.',
                    variant: 'destructive'
                });
            }
            setDeleteCoupon(null);
        }
    };

    const handleToggleActive = async (coupon: Coupon) => {
        const result = await couponService.toggleCouponStatus(coupon._id, !coupon.isActive);

        if (result.success) {
            toast({
                title: `Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`,
                description: `"${coupon.code}" has been ${!coupon.isActive ? 'activated' : 'deactivated'}.`
            });
            fetchCoupons();
        } else {
            toast({
                title: 'Error',
                description: result.error || `Failed to update coupon status.`,
                variant: 'destructive'
            });
        }
    };

    const columns = [
        {
            key: 'code',
            header: 'Coupon Code',
            render: (coupon: Coupon) => (
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Ticket className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded border">
                                {coupon.code}
                            </span>
                            {!coupon.isListed && (
                                <Badge variant="outline" className="text-[10px] h-4 bg-amber-50 text-amber-600 border-amber-200">
                                    <EyeOff className="w-3 h-3 mr-1" /> Secret
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                            {coupon.description}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'discount',
            header: 'Discount',
            render: (coupon: Coupon) => (
                <div>
                    <div className="font-medium">
                        {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% Off`
                            : `₹${coupon.discountValue} Off`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Min purchase: ₹{coupon.minPurchaseAmount}
                    </div>
                </div>
            ),
        },
        {
            key: 'rules',
            header: 'Rules',
            render: (coupon: Coupon) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {coupon.isReusable ? (
                            <><Users className="w-3 h-3" /> Reusable</>
                        ) : (
                            <><UserCheck className="w-3 h-3" /> One-time per user</>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {coupon.isListed ? (
                            <><Eye className="w-3 h-3" /> Public</>
                        ) : (
                            <><EyeOff className="w-3 h-3" /> Hidden</>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'usage',
            header: 'Global Usage',
            render: (coupon: Coupon) => (
                <div className="text-sm">
                    <div className="flex items-center gap-2">
                        <span>{coupon.usedCount || 0}</span>
                        <span className="text-muted-foreground">/</span>
                        <span>{coupon.usageLimit}</span>
                    </div>
                    <div className="w-24 h-1.5 bg-secondary rounded-full mt-1.5 overflow-hidden">
                        <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(((coupon.usedCount || 0) / coupon.usageLimit) * 100, 100)}%` }}
                        />
                    </div>
                    {coupon.usedBy && coupon.usedBy.length > 0 && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                            Used by {coupon.usedBy.length} users
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (coupon: Coupon) => (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => handleToggleActive(coupon)}
                    />
                    <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (coupon: Coupon) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(coupon)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setDeleteCoupon(coupon)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Coupons Management"
                description="Create and manage discount coupons for your customers"
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Coupon
                    </Button>
                }
            />

            <DataTable
                data={coupons}
                columns={columns}
                rowKey="_id"
                searchKey="code"
                searchPlaceholder="Search coupons by code..."
                emptyMessage={isLoading ? "Loading coupons..." : "No coupons found"}
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Create New Coupon</DialogTitle>
                    </DialogHeader>
                    <CouponForm
                        formData={formData}
                        setFormData={setFormData}
                        editCoupon={null}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Create Coupon</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editCoupon} onOpenChange={() => setEditCoupon(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Coupon</DialogTitle>
                    </DialogHeader>
                    <CouponForm
                        formData={formData}
                        setFormData={setFormData}
                        editCoupon={editCoupon}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditCoupon(null)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteCoupon}
                onOpenChange={() => setDeleteCoupon(null)}
                title="Delete Coupon"
                description={`Are you sure you want to delete coupon "${deleteCoupon?.code}"? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                variant="destructive"
            />
        </div>
    );
}
