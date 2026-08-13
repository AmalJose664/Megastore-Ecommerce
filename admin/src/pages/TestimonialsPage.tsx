import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, MessageSquareQuote } from 'lucide-react';
import { Testimonial, CreateTestimonialRequest } from '@/types';
import { testimonialsService } from '@/services/testimonialsService';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
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
import { TestimonialForm } from '@/components/testimonials/TestimonialForm';

export default function TestimonialsPage() {
    const { toast } = useToast();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editTestimonial, setEditTestimonial] = useState<Testimonial | null>(null);
    const [deleteTestimonial, setDeleteTestimonial] = useState<Testimonial | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const initialFormData: CreateTestimonialRequest = {
        name: '',
        role: '',
        content: '',
        rating: 5,
        avatar: '',
        isApproved: true,
        displayOrder: 1,
    };

    const [formData, setFormData] = useState<CreateTestimonialRequest>(initialFormData);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setIsLoading(true);
        const data = await testimonialsService.getTestimonials();
        if (data) {
            setTestimonials(data);
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

    const openEdit = (testimonial: Testimonial) => {
        setEditTestimonial(testimonial);
        // Form data will be populated by the useEffect in TestimonialForm, 
        // but we can also set it here to be safe or if we change the form logic later.
        setFormData({
            name: testimonial.name,
            role: testimonial.role,
            content: testimonial.content,
            rating: testimonial.rating,
            avatar: testimonial.avatar,
            isApproved: testimonial.isApproved,
            displayOrder: testimonial.displayOrder,
        });
    };

    const handleSave = async () => {
        // Basic validation
        if (!formData.name.trim() || !formData.content.trim()) {
            toast({
                title: 'Error',
                description: 'Name and Content are required',
                variant: 'destructive',
            });
            return;
        }

        if (editTestimonial) {
            const updated = await testimonialsService.updateTestimonial(editTestimonial._id, formData);
            if (updated) {
                toast({ title: 'Testimonial updated', description: `Testimonial from ${formData.name} has been updated.` });
                setEditTestimonial(null);
                fetchTestimonials();
            } else {
                toast({ title: 'Error', description: 'Failed to update testimonial', variant: 'destructive' });
            }
        } else {
            const created = await testimonialsService.createTestimonial(formData);
            if (created) {
                toast({ title: 'Testimonial created', description: `Testimonial from ${formData.name} has been created.` });
                setIsCreateOpen(false);
                fetchTestimonials();
            } else {
                toast({ title: 'Error', description: 'Failed to create testimonial', variant: 'destructive' });
            }
        }
        resetForm();
    };

    const handleDelete = async () => {
        if (deleteTestimonial) {
            const success = await testimonialsService.deleteTestimonial(deleteTestimonial._id);
            if (success) {
                toast({ title: 'Testimonial deleted', description: `Testimonial from ${deleteTestimonial.name} has been deleted.` });
                fetchTestimonials();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete testimonial.',
                    variant: 'destructive'
                });
            }
            setDeleteTestimonial(null);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'User',
            render: (testimonial: Testimonial) => (
                <div className="flex items-center gap-3">
                    {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {testimonial.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'rating',
            header: 'Rating',
            render: (testimonial: Testimonial) => (
                <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < testimonial.rating ? "text-yellow-500" : "text-gray-300"}>★</span>
                    ))}
                </div>
            ),
        },
        {
            key: 'content',
            header: 'Content',
            render: (testimonial: Testimonial) => (
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-md" title={testimonial.content}>
                    {testimonial.content}
                </p>
            ),
        },
        {
            key: 'isApproved',
            header: 'Status',
            render: (testimonial: Testimonial) => <StatusBadge status={testimonial.isApproved ? 'active' : 'inactive'} />,
        },
        {
            key: 'displayOrder',
            header: 'Order',
            render: (testimonial: Testimonial) => (
                <span className="text-sm">{testimonial.displayOrder}</span>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (testimonial: Testimonial) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(testimonial)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setDeleteTestimonial(testimonial)}
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
                title="Testimonials"
                description="Manage customer testimonials and reviews"
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Testimonial
                    </Button>
                }
            />

            <DataTable
                data={testimonials}
                columns={columns}
                rowKey="_id"
                searchKey="name"
                searchPlaceholder="Search testimonials..."
                emptyMessage={isLoading ? "Loading testimonials..." : "No testimonials found"}
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Testimonial</DialogTitle>
                    </DialogHeader>
                    <TestimonialForm
                        formData={formData}
                        setFormData={setFormData}
                        editTestimonial={null}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTestimonial} onOpenChange={() => setEditTestimonial(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Testimonial</DialogTitle>
                    </DialogHeader>
                    <TestimonialForm
                        formData={formData}
                        setFormData={setFormData}
                        editTestimonial={editTestimonial}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTestimonial(null)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteTestimonial}
                onOpenChange={() => setDeleteTestimonial(null)}
                title="Delete Testimonial"
                description={`Are you sure you want to delete the testimonial from "${deleteTestimonial?.name}"?`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                variant="destructive"
            />
        </div>
    );
}
