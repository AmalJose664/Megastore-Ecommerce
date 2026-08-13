import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CreateTestimonialRequest, Testimonial } from '@/types';

interface TestimonialFormProps {
    formData: CreateTestimonialRequest;
    setFormData: React.Dispatch<React.SetStateAction<CreateTestimonialRequest>>;
    editTestimonial: Testimonial | null;
}

export function TestimonialForm({ formData, setFormData, editTestimonial }: TestimonialFormProps) {

    useEffect(() => {
        if (editTestimonial) {
            setFormData({
                name: editTestimonial.name,
                role: editTestimonial.role,
                content: editTestimonial.content,
                rating: editTestimonial.rating,
                avatar: editTestimonial.avatar,
                isApproved: editTestimonial.isApproved,
                displayOrder: editTestimonial.displayOrder,
            });
        }
    }, [editTestimonial, setFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'rating' || name === 'displayOrder' ? Number(value) : value
        }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isApproved: checked
        }));
    };

    return (
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="e.g. CEO"
                        required
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Enter testimonial content..."
                    className="h-24"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                        id="rating"
                        name="rating"
                        type="number"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                        id="displayOrder"
                        name="displayOrder"
                        type="number"
                        value={formData.displayOrder}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                    id="avatar"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                />
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Switch
                    id="isApproved"
                    checked={formData.isApproved}
                    onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isApproved">Approved (Publicly Visible)</Label>
            </div>
        </div>
    );
}
