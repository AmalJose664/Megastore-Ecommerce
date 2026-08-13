import React from 'react';
import { Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface CategoryFormProps {
    formData: {
        name: string;
        description: string;
        parentCategory: string;
        displayOrder: number;
        isActive: boolean;
    };
    setFormData: React.Dispatch<React.SetStateAction<{
        name: string;
        description: string;
        parentCategory: string;
        displayOrder: number;
        isActive: boolean;
    }>>;
    categories: Category[];
    editCategory: Category | null;
}

export const CategoryForm = ({ formData, setFormData, categories, editCategory }: CategoryFormProps) => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Category name"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="parent">Parent Category</Label>
            <Select
                value={formData.parentCategory || 'root'}
                onValueChange={value => setFormData(prev => ({ ...prev, parentCategory: value }))}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="root">None (Root)</SelectItem>
                    {categories
                        .filter(c => editCategory ? c._id !== editCategory._id : true)
                        .map(c => (
                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                        ))
                    }
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={e => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Category description (optional)"
                rows={3}
            />
        </div>
        <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
        </div>
    </div>
);
