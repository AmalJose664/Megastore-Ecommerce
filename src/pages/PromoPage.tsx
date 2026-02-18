import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Image as ImageIcon, Tag } from 'lucide-react';
import { PromoSection, CreatePromoRequest } from '@/types';
import { promoService } from '@/services/promoService';
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
import { PromoForm } from '@/components/promo/PromoForm';

export default function PromoPage() {
    const { toast } = useToast();
    const [promos, setPromos] = useState<PromoSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editPromo, setEditPromo] = useState<PromoSection | null>(null);
    const [deletePromo, setDeletePromo] = useState<PromoSection | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const initialFormData: CreatePromoRequest = {
        tag: '',
        title: '',
        description: '',
        code: '',
        terms: '',
        link: '',
        image: '',
        isActive: true,
    };

    const [formData, setFormData] = useState<CreatePromoRequest>(initialFormData);

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        setIsLoading(true);
        const data = await promoService.getPromos();
        if (data) {
            setPromos(data);
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

    const openEdit = (promo: PromoSection) => {
        setEditPromo(promo);
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast({
                title: 'Error',
                description: 'Title is required',
                variant: 'destructive',
            });
            return;
        }

        if (editPromo) {
            const result = await promoService.updatePromo(editPromo._id, formData);
            if (result.success) {
                toast({ title: 'Promo section updated', description: `Promo "${formData.title}" has been updated.` });
                setEditPromo(null);
                fetchPromos();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to update promo section',
                    variant: 'destructive'
                });
            }
        } else {
            const result = await promoService.createPromo(formData);
            if (result.success) {
                toast({ title: 'Promo section created', description: `Promo "${formData.title}" has been created.` });
                setIsCreateOpen(false);
                fetchPromos();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to create promo section',
                    variant: 'destructive'
                });
            }
        }
    };

    const handleDelete = async () => {
        if (deletePromo) {
            const result = await promoService.deletePromo(deletePromo._id);
            if (result.success) {
                toast({ title: 'Promo section deleted', description: `Promo "${deletePromo.title}" has been deleted.` });
                fetchPromos();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to delete promo section.',
                    variant: 'destructive'
                });
            }
            setDeletePromo(null);
        }
    };

    const handleToggleActive = async (promo: PromoSection) => {
        console.log('🔄 Toggle clicked for promo:', {
            id: promo._id,
            title: promo.title,
            currentStatus: promo.isActive
        });

        const action = promo.isActive ? 'deactivate' : 'activate';
        console.log(`📤 Calling API to ${action} promo ID:`, promo._id);

        const result = promo.isActive
            ? await promoService.deactivatePromo(promo._id)
            : await promoService.activatePromo(promo._id);

        console.log('📥 API Response:', result);

        if (result.success) {
            console.log('✅ Success! Activated promo:', result.data);
            toast({
                title: `Promo section ${action}d`,
                description: `"${promo.title}" has been ${action}d.`
            });
            fetchPromos();
        } else {
            console.error('❌ Error:', result.error);
            toast({
                title: 'Error',
                description: result.error || `Failed to ${action} promo section.`,
                variant: 'destructive'
            });
        }
    };

    const columns = [
        {
            key: 'image',
            header: 'Image',
            render: (promo: PromoSection) => (
                <div className="w-20 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    {promo.image ? (
                        <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            ),
        },
        {
            key: 'info',
            header: 'Promo Info',
            render: (promo: PromoSection) => (
                <div>
                    <div className="font-medium flex items-center gap-2">
                        {promo.title}
                        {promo.tag && <Badge variant="secondary" className="text-xs py-0 h-5">{promo.tag}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-mono bg-muted px-1 rounded text-xs">{promo.code}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                        <span className="truncate max-w-[200px]">{promo.description}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (promo: PromoSection) => (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={promo.isActive}
                        onCheckedChange={() => handleToggleActive(promo)}
                    />
                    <span className="text-sm text-muted-foreground">
                        {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (promo: PromoSection) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(promo)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setDeletePromo(promo)}
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
                title="Promo Sections"
                description="Manage promotional banners and flash sales"
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Promo Section
                    </Button>
                }
            />

            <DataTable
                data={promos}
                columns={columns}
                rowKey="_id"
                searchKey="title"
                searchPlaceholder="Search promo sections..."
                emptyMessage={isLoading ? "Loading promo sections..." : "No promo sections found"}
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Add Promo Section</DialogTitle>
                    </DialogHeader>
                    <PromoForm
                        formData={formData}
                        setFormData={setFormData}
                        editPromo={null}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editPromo} onOpenChange={() => setEditPromo(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Promo Section</DialogTitle>
                    </DialogHeader>
                    <PromoForm
                        formData={formData}
                        setFormData={setFormData}
                        editPromo={editPromo}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditPromo(null)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deletePromo}
                onOpenChange={() => setDeletePromo(null)}
                title="Delete Promo Section"
                description={`Are you sure you want to delete "${deletePromo?.title}"?`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                variant="destructive"
            />
        </div>
    );
}
