import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreateBannerRequest, Banner } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface BannerFormProps {
    formData: CreateBannerRequest;
    setFormData: React.Dispatch<React.SetStateAction<CreateBannerRequest>>;
    editBanner: Banner | null;
}

export function BannerForm({ formData, setFormData, editBanner }: BannerFormProps) {

    useEffect(() => {
        if (editBanner) {
            setFormData({
                position: editBanner.position,
                title: editBanner.title,
                subtitle: editBanner.subtitle || '',
                description: editBanner.description || '',
                image: editBanner.image || '',
                buttonText: editBanner.buttonText || '',
                buttonLink: editBanner.buttonLink || '',
                badge: editBanner.badge || '',
                code: editBanner.code || '',
                stats: editBanner.stats || [],
                startDate: editBanner.startDate ? new Date(editBanner.startDate).toISOString().split('T')[0] : '',
                endDate: editBanner.endDate ? new Date(editBanner.endDate).toISOString().split('T')[0] : '',
                isActive: editBanner.isActive,
                displayOrder: editBanner.displayOrder,
            });
        }
    }, [editBanner, setFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'displayOrder' ? Number(value) : value
        }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isActive: checked
        }));
    };

    const handlePositionChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            position: value as any
        }));
    };

    // Stats management for Hero banners
    const addStat = () => {
        setFormData(prev => ({
            ...prev,
            stats: [...(prev.stats || []), { value: '', label: '' }]
        }));
    };

    const removeStat = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stats: (prev.stats || []).filter((_, i) => i !== index)
        }));
    };

    const updateStat = (index: number, field: 'value' | 'label', value: string) => {
        setFormData(prev => ({
            ...prev,
            stats: (prev.stats || []).map((stat, i) =>
                i === index ? { ...stat, [field]: value } : stat
            )
        }));
    };

    return (
        <div className="space-y-4 py-4 h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                        value={formData.position}
                        onValueChange={handlePositionChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="hero">Hero Section</SelectItem>
                            <SelectItem value="promo">Promo Banner</SelectItem>
                            <SelectItem value="deal">Deals Section</SelectItem>
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                        id="displayOrder"
                        name="displayOrder"
                        type="number"
                        value={formData.displayOrder}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Main heading"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                        id="subtitle"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleChange}
                        placeholder="Secondary heading"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="badge">Badge/Tag</Label>
                    <Input
                        id="badge"
                        name="badge"
                        value={formData.badge}
                        onChange={handleChange}
                        placeholder="e.g. New Arrival, Sale"
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
                    placeholder="Detailed description..."
                    className="h-20"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/banner.jpg"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                        id="buttonText"
                        name="buttonText"
                        value={formData.buttonText}
                        onChange={handleChange}
                        placeholder="e.g. Shop Now"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="buttonLink">Button Link</Label>
                    <Input
                        id="buttonLink"
                        name="buttonLink"
                        value={formData.buttonLink}
                        onChange={handleChange}
                        placeholder="e.g. /products/category"
                    />
                </div>
            </div>

            {formData.position === 'promo' && (
                <div className="grid gap-2">
                    <Label htmlFor="code">Promo Code</Label>
                    <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="e.g. SAVE50"
                    />
                </div>
            )}

            {formData.position === 'hero' && (
                <div className="space-y-2 border p-3 rounded-md">
                    <div className="flex justify-between items-center">
                        <Label>Stats (Optional)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addStat}>
                            <Plus className="w-3 h-3 mr-1" /> Add Stat
                        </Button>
                    </div>

                    {(formData.stats || []).map((stat, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <Input
                                placeholder="Value (e.g. 100+)"
                                value={stat.value}
                                onChange={(e) => updateStat(index, 'value', e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                placeholder="Label (e.g. Brands)"
                                value={stat.label}
                                onChange={(e) => updateStat(index, 'label', e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStat(index)}
                            >
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    {(formData.stats || []).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">No stats added</p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isActive">Active (Visible on Site)</Label>
            </div>
        </div>
    );
}
