import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { HeroSection, CreateHeroRequest } from '@/types';
import { heroService } from '@/services/heroService';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
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
import { HeroForm } from '@/components/hero/HeroForm';

export default function HeroPage() {
    const { toast } = useToast();
    const [heroes, setHeroes] = useState<HeroSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editHero, setEditHero] = useState<HeroSection | null>(null);
    const [deleteHero, setDeleteHero] = useState<HeroSection | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const initialFormData: CreateHeroRequest = {
        badge: '',
        title: '',
        subtitle: '',
        ctaText: '',
        ctaLink: '',
        secondaryCtaText: '',
        secondaryCtaLink: '',
        image: '',
        stats: [],
        isActive: true,
    };

    const [formData, setFormData] = useState<CreateHeroRequest>(initialFormData);

    useEffect(() => {
        fetchHeroes();
    }, []);

    const fetchHeroes = async () => {
        setIsLoading(true);
        const data = await heroService.getHeroes();
        if (data) {
            setHeroes(data);
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

    const openEdit = (hero: HeroSection) => {
        setEditHero(hero);
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

        if (editHero) {
            const result = await heroService.updateHero(editHero._id, formData);
            if (result.success) {
                toast({ title: 'Hero section updated', description: `Hero "${formData.title}" has been updated.` });
                setEditHero(null);
                fetchHeroes();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to update hero section',
                    variant: 'destructive'
                });
            }
        } else {
            const result = await heroService.createHero(formData);
            if (result.success) {
                toast({ title: 'Hero section created', description: `Hero "${formData.title}" has been created.` });
                setIsCreateOpen(false);
                fetchHeroes();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to create hero section',
                    variant: 'destructive'
                });
            }
        }
    };

    const handleDelete = async () => {
        if (deleteHero) {
            const result = await heroService.deleteHero(deleteHero._id);
            if (result.success) {
                toast({ title: 'Hero section deleted', description: `Hero "${deleteHero.title}" has been deleted.` });
                fetchHeroes();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to delete hero section.',
                    variant: 'destructive'
                });
            }
            setDeleteHero(null);
        }
    };

    const handleToggleActive = async (hero: HeroSection) => {
        console.log('🔄 Toggle clicked for hero:', {
            id: hero._id,
            title: hero.title,
            currentStatus: hero.isActive
        });

        const action = hero.isActive ? 'deactivate' : 'activate';
        console.log(`📤 Calling API to ${action} hero ID:`, hero._id);

        const result = hero.isActive
            ? await heroService.deactivateHero(hero._id)
            : await heroService.activateHero(hero._id);

        console.log('📥 API Response:', result);

        if (result.success) {
            console.log('✅ Success! Activated hero:', result.data);
            toast({
                title: `Hero section ${action}d`,
                description: `"${hero.title}" has been ${action}d.`
            });
            fetchHeroes();
        } else {
            console.error('❌ Error:', result.error);
            toast({
                title: 'Error',
                description: result.error || `Failed to ${action} hero section.`,
                variant: 'destructive'
            });
        }
    };

    const columns = [
        {
            key: 'image',
            header: 'Image',
            render: (hero: HeroSection) => (
                <div className="w-20 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    {hero.image ? (
                        <img src={hero.image} alt={hero.title} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            ),
        },
        {
            key: 'info',
            header: 'Hero Info',
            render: (hero: HeroSection) => (
                <div>
                    <div className="font-medium flex items-center gap-2">
                        {hero.title}
                        {hero.badge && <Badge variant="outline" className="text-xs py-0 h-5">{hero.badge}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {hero.subtitle}
                    </div>
                </div>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (hero: HeroSection) => (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={hero.isActive}
                        onCheckedChange={() => handleToggleActive(hero)}
                    />
                    <span className="text-sm text-muted-foreground">
                        {hero.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (hero: HeroSection) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(hero)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setDeleteHero(hero)}
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
                title="Hero Sections"
                description="Manage the main hero sliders on the homepage"
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Hero Section
                    </Button>
                }
            />

            <DataTable
                data={heroes}
                columns={columns}
                rowKey="_id"
                searchKey="title"
                searchPlaceholder="Search hero sections..."
                emptyMessage={isLoading ? "Loading hero sections..." : "No hero sections found"}
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Add Hero Section</DialogTitle>
                    </DialogHeader>
                    <HeroForm
                        formData={formData}
                        setFormData={setFormData}
                        editHero={null}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editHero} onOpenChange={() => setEditHero(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Hero Section</DialogTitle>
                    </DialogHeader>
                    <HeroForm
                        formData={formData}
                        setFormData={setFormData}
                        editHero={editHero}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditHero(null)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteHero}
                onOpenChange={() => setDeleteHero(null)}
                title="Delete Hero Section"
                description={`Are you sure you want to delete "${deleteHero?.title}"?`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                variant="destructive"
            />
        </div>
    );
}
