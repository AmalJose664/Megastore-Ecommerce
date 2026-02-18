import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Banner, CreateBannerRequest } from '@/types';
import { bannersService } from '@/services/bannersService';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { BannerForm } from '@/components/banners/BannerForm';

export default function BannersPage() {
    const { toast } = useToast();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editBanner, setEditBanner] = useState<Banner | null>(null);
    const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const initialFormData: CreateBannerRequest = {
        position: 'hero',
        title: '',
        subtitle: '',
        description: '',
        image: '',
        buttonText: '',
        buttonLink: '',
        badge: '',
        code: '',
        stats: [],
        isActive: true,
        displayOrder: 1,
        startDate: '',
        endDate: '',
    };

    const [formData, setFormData] = useState<CreateBannerRequest>(initialFormData);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setIsLoading(true);
        const data = await bannersService.getBanners();
        if (data) {
            setBanners(data);
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

    const openEdit = (banner: Banner) => {
        setEditBanner(banner);
        // Form data populated via useEffect in BannerForm
    };

    const handleSave = async () => {
        // Basic validation
        if (!formData.title.trim()) {
            toast({
                title: 'Error',
                description: 'Title is required',
                variant: 'destructive',
            });
            return;
        }

        if (editBanner) {
            const updated = await bannersService.updateBanner(editBanner._id, formData);
            if (updated) {
                toast({ title: 'Banner updated', description: `Banner "${formData.title}" has been updated.` });
                setEditBanner(null);
                fetchBanners();
            } else {
                toast({ title: 'Error', description: 'Failed to update banner', variant: 'destructive' });
            }
        } else {
            const created = await bannersService.createBanner(formData);
            if (created) {
                toast({ title: 'Banner created', description: `Banner "${formData.title}" has been created.` });
                setIsCreateOpen(false);
                fetchBanners();
            } else {
                toast({ title: 'Error', description: 'Failed to create banner', variant: 'destructive' });
            }
        }
    };

    const handleDelete = async () => {
        if (deleteBanner) {
            const success = await bannersService.deleteBanner(deleteBanner._id);
            if (success) {
                toast({ title: 'Banner deleted', description: `Banner "${deleteBanner.title}" has been deleted.` });
                fetchBanners();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete banner.',
                    variant: 'destructive'
                });
            }
            setDeleteBanner(null);
        }
    };

    const columns = [
        {
            key: 'image',
            header: 'Image',
            render: (banner: Banner) => (
                <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    {banner.image ? (
                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            ),
        },
        {
            key: 'info',
            header: 'Banner Info',
            render: (banner: Banner) => (
                <div>
                    <div className="font-medium flex items-center gap-2">
                        {banner.title}
                        {banner.badge && <Badge variant="outline" className="text-xs py-0 h-5">{banner.badge}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-2">
                        <span className="capitalize text-primary font-medium">{banner.position}</span>
                        {banner.subtitle && <span>• {banner.subtitle}</span>}
                    </div>
                </div>
            ),
        },
        {
            key: 'dates',
            header: 'Schedule',
            render: (banner: Banner) => {
                if (!banner.startDate && !banner.endDate) return <span className="text-xs text-muted-foreground">Always active</span>;

                return (
                    <div className="text-xs space-y-1">
                        {banner.startDate && <div>Start: {new Date(banner.startDate).toLocaleDateString()}</div>}
                        {banner.endDate && <div>End: {new Date(banner.endDate).toLocaleDateString()}</div>}
                    </div>
                );
            },
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (banner: Banner) => <StatusBadge status={banner.isActive ? 'active' : 'inactive'} />,
        },
        {
            key: 'displayOrder',
            header: 'Order',
            render: (banner: Banner) => (
                <span className="text-sm">{banner.displayOrder}</span>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (banner: Banner) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(banner)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        {banner.buttonLink && (
                            <DropdownMenuItem onClick={() => window.open(banner.buttonLink, '_blank')}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Link
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onClick={() => setDeleteBanner(banner)}
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
                title="Banners & Sections"
                description="Manage hero sliders, promo banners, and other dynamic sections"
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Banner
                    </Button>
                }
            />

            <DataTable
                data={banners}
                columns={columns}
                rowKey="_id"
                searchKey="title"
                searchPlaceholder="Search banners..."
                emptyMessage={isLoading ? "Loading banners..." : "No banners found"}
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Add Banner</DialogTitle>
                    </DialogHeader>
                    <BannerForm
                        formData={formData}
                        setFormData={setFormData}
                        editBanner={null}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editBanner} onOpenChange={() => setEditBanner(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Banner</DialogTitle>
                    </DialogHeader>
                    <BannerForm
                        formData={formData}
                        setFormData={setFormData}
                        editBanner={editBanner}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditBanner(null)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteBanner}
                onOpenChange={() => setDeleteBanner(null)}
                title="Delete Banner"
                description={`Are you sure you want to delete the banner "${deleteBanner?.title}"?`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                variant="destructive"
            />
        </div>
    );
}
