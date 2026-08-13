import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateCouponRequest, Coupon } from '@/types';

interface CouponFormProps {
    formData: CreateCouponRequest;
    setFormData: React.Dispatch<React.SetStateAction<CreateCouponRequest>>;
    editCoupon: Coupon | null;
}

export function CouponForm({ formData, setFormData, editCoupon }: CouponFormProps) {

    useEffect(() => {
        if (editCoupon) {
            setFormData({
                code: editCoupon.code,
                description: editCoupon.description,
                discountType: editCoupon.discountType,
                discountValue: editCoupon.discountValue,
                minPurchaseAmount: editCoupon.minPurchaseAmount,
                validFrom: editCoupon.validFrom.split('T')[0],
                validUntil: editCoupon.validUntil.split('T')[0],
                usageLimit: editCoupon.usageLimit,
                isListed: editCoupon.isListed,
                isReusable: editCoupon.isReusable,
                isActive: editCoupon.isActive,
            });
        }
    }, [editCoupon, setFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    return (
        <div className="space-y-4 py-4 h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="e.g. ONETIME50"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select
                        value={formData.discountType}
                        onValueChange={(v) => handleSelectChange('discountType', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="discountValue">Discount Value</Label>
                    <Input
                        id="discountValue"
                        name="discountValue"
                        type="number"
                        value={formData.discountValue}
                        onChange={handleChange}
                        placeholder="e.g. 50"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="minPurchaseAmount">Min Purchase Amount</Label>
                    <Input
                        id="minPurchaseAmount"
                        name="minPurchaseAmount"
                        type="number"
                        value={formData.minPurchaseAmount}
                        onChange={handleChange}
                        placeholder="e.g. 500"
                        required
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the coupon benefits..."
                    className="h-20"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                        id="validFrom"
                        name="validFrom"
                        type="date"
                        value={formData.validFrom}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                        id="validUntil"
                        name="validUntil"
                        type="date"
                        value={formData.validUntil}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="usageLimit">Global Usage Limit</Label>
                <Input
                    id="usageLimit"
                    name="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    placeholder="Total times this can be used"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="isListed"
                        checked={formData.isListed}
                        onCheckedChange={(checked) => handleSwitchChange('isListed', checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="isListed">Publicly Listed</Label>
                        <p className="text-xs text-muted-foreground">Is this code visible to all users?</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="isReusable"
                        checked={formData.isReusable}
                        onCheckedChange={(checked) => handleSwitchChange('isReusable', checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="isReusable">Reusable per User</Label>
                        <p className="text-xs text-muted-foreground">Can a single user use this multiple times?</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t">
                <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Active (System wide toggle)</Label>
            </div>
        </div>
    );
}
