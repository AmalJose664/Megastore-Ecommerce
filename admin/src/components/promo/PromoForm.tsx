import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CreatePromoRequest, PromoSection } from '@/types';

interface PromoFormProps {
    formData: CreatePromoRequest;
    setFormData: React.Dispatch<React.SetStateAction<CreatePromoRequest>>;
    editPromo: PromoSection | null;
}

export function PromoForm({ formData, setFormData, editPromo }: PromoFormProps) {

    useEffect(() => {
        if (editPromo) {
            setFormData({
                tag: editPromo.tag,
                title: editPromo.title,
                description: editPromo.description,
                code: editPromo.code,
                terms: editPromo.terms,
                link: editPromo.link,
                image: editPromo.image,
                isActive: editPromo.isActive,
            });
        }
    }, [editPromo, setFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isActive: checked
        }));
    };

    return (
        <div className="space-y-4 py-4 h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="tag">Tag</Label>
                    <Input
                        id="tag"
                        name="tag"
                        value={formData.tag}
                        onChange={handleChange}
                        placeholder="e.g. Flash Deal"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="code">Promo Code</Label>
                    <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="e.g. MIDNIGHT50"
                        required
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

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Promo description..."
                    className="h-20"
                    required
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/promo.jpg"
                    required
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="link">Link</Label>
                <Input
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="e.g. /products?sale=true"
                    required
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Input
                    id="terms"
                    name="terms"
                    value={formData.terms}
                    onChange={handleChange}
                    placeholder="e.g. Valid until midnight"
                    required
                />
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
