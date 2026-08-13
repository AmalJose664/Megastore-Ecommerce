import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, ExternalLink, Layers, Sparkles, Layout } from 'lucide-react';
import { BannerSection, BannerSlide, CreateBannerSectionRequest, BannerSize } from '@/types';
import { bannerSectionService } from '@/services/bannerSectionService';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function BannersPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<BannerSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editSection, setEditSection] = useState<BannerSection | null>(null);
  const [deleteSection, setDeleteSection] = useState<BannerSection | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const emptySlide: BannerSlide = {
    imageUrl: '',
    imageTitle: '',
    subtitle: '',
    buttonText: 'Shop Now',
    navigateLink: '/products',
    priority: 1,
    badge: '',
    isActive: true,
  };

  const initialFormData: CreateBannerSectionRequest = {
    title: '',
    subtitle: '',
    size: BannerSize.MD,
    displayOrder: 1,
    autoScrollInterval: 4000,
    isActive: true,
    slides: [emptySlide],
  };

  const [formData, setFormData] = useState<CreateBannerSectionRequest>(initialFormData);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setIsLoading(true);
    const data = await bannerSectionService.getAllSections();
    if (data) {
      setSections(data);
    }
    setIsLoading(false);
  };

  const openCreate = () => {
    setFormData({
      ...initialFormData,
      displayOrder: Math.min(sections.length + 1, 3),
      slides: [{ ...emptySlide, priority: 1 }],
    });
    setEditSection(null);
    setIsCreateOpen(true);
  };

  const openEdit = (section: BannerSection) => {
    setEditSection(section);
    setFormData({
      title: section.title,
      subtitle: section.subtitle || '',
      size: section.size || BannerSize.MD,
      displayOrder: section.displayOrder,
      autoScrollInterval: section.autoScrollInterval || 4000,
      isActive: section.isActive,
      slides: section.slides && section.slides.length > 0 ? [...section.slides] : [{ ...emptySlide }],
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Banner section title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.slides || formData.slides.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one image slide to the banner section',
        variant: 'destructive',
      });
      return;
    }

    const invalidSlide = formData.slides.find((s) => !s.imageUrl.trim());
    if (invalidSlide) {
      toast({
        title: 'Error',
        description: 'All slides must have a valid Image URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editSection) {
        const updated = await bannerSectionService.updateSection(editSection._id, formData);
        if (updated) {
          toast({ title: 'Success', description: `Banner section "${formData.title}" updated.` });
          setEditSection(null);
          fetchSections();
        }
      } else {
        const created = await bannerSectionService.createSection(formData);
        if (created) {
          toast({ title: 'Success', description: `Banner section "${formData.title}" created.` });
          setIsCreateOpen(false);
          fetchSections();
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save banner section',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (deleteSection) {
      const success = await bannerSectionService.deleteSection(deleteSection._id);
      if (success) {
        toast({ title: 'Section deleted', description: `Deleted section "${deleteSection.title}".` });
        fetchSections();
      } else {
        toast({ title: 'Error', description: 'Failed to delete section', variant: 'destructive' });
      }
      setDeleteSection(null);
    }
  };

  const addSlide = () => {
    setFormData((prev) => ({
      ...prev,
      slides: [
        ...prev.slides,
        {
          ...emptySlide,
          priority: prev.slides.length + 1,
        },
      ],
    }));
  };

  const removeSlide = (index: number) => {
    if (formData.slides.length <= 1) {
      toast({
        title: 'Warning',
        description: 'Banner section must have at least one slide',
        variant: 'destructive',
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
  };

  const updateSlide = (index: number, key: keyof BannerSlide, value: any) => {
    setFormData((prev) => {
      const newSlides = [...prev.slides];
      newSlides[index] = { ...newSlides[index], [key]: value };
      return { ...prev, slides: newSlides };
    });
  };

  const activeCount = sections.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom Banner Sections"
        description="Manage up to 3 homepage banner sections with auto-scrolling image carousels & side-by-side layouts"
        actions={
          <Button onClick={openCreate} disabled={activeCount >= 3 && sections.length >= 5}>
            <Plus className="w-4 h-4 mr-2" />
            Add Banner Section ({activeCount}/3 Active)
          </Button>
        }
      />

      {/* Info Badge */}
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-foreground">
          You can create multiple banner sections. Up to <strong>3 sections</strong> can be active on the homepage at once. Choose from 4 sizes: <code>sm</code>, <code>md</code>, <code>lg</code>, or <code>side-by-side</code> (text left, image right presentation).
        </p>
      </div>

      {/* Section Cards */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : sections.length === 0 ? (
        <div className="card-elevated p-12 text-center space-y-4">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Banner Sections Found</h3>
          <p className="text-sm text-muted-foreground">
            Create your first auto-scrolling banner section for the homepage.
          </p>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Section
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={section._id} className="card-elevated p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs uppercase bg-secondary">
                      Section #{section.displayOrder || idx + 1}
                    </Badge>
                    <h3 className="text-lg font-bold">{section.title}</h3>
                    <Badge className="capitalize text-xs font-semibold">
                      Size: {(section.size || BannerSize.MD).toUpperCase()}
                    </Badge>
                    <StatusBadge status={section.isActive ? 'active' : 'inactive'} />
                  </div>
                  {section.subtitle && (
                    <p className="text-sm text-muted-foreground">Outside Subtitle: {section.subtitle}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(section)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit Section
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteSection(section)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>

              {/* Slides Grid Preview */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Slides ({section.slides?.length || 0}) • Auto-scroll: {(section.autoScrollInterval || 4000) / 1000}s
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {section.slides?.map((slide, sIdx) => (
                    <div
                      key={slide._id || sIdx}
                      className="border border-border rounded-xl p-3 bg-muted/20 space-y-2 relative group"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black/5">
                        <img
                          src={slide.imageUrl}
                          alt={slide.imageTitle || slide.title || 'Slide'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                          Priority #{slide.priority}
                        </div>
                        {slide.badge && (
                          <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            {slide.badge}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold truncate">
                          {slide.imageTitle || slide.title || 'Untitled Slide'}
                        </p>
                        {slide.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">Inside Subtitle: {slide.subtitle}</p>
                        )}
                      </div>

                      {slide.navigateLink && (
                        <a
                          href={slide.navigateLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-primary flex items-center gap-1 hover:underline truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" /> {slide.navigateLink}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editSection}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditSection(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editSection ? 'Edit Banner Section' : 'Create Banner Section'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Section Main Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="space-y-2">
                <Label htmlFor="sec-title">Section Outside Title (Displayed above banner) *</Label>
                <Input
                  id="sec-title"
                  placeholder="e.g. Summer Festival Offers"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sec-subtitle">Section Outside Subtitle (Displayed above banner)</Label>
                <Input
                  id="sec-subtitle"
                  placeholder="e.g. Limited time deals up to 50% OFF"
                  value={formData.subtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Banner Size & Layout *</Label>
                <Select
                  value={formData.size}
                  onValueChange={(val: BannerSize) =>
                    setFormData((prev) => ({ ...prev, size: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Banner Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BannerSize.SM}>Small (Compact Overlay Banner)</SelectItem>
                    <SelectItem value={BannerSize.MD}>Medium (Standard Overlay Banner)</SelectItem>
                    <SelectItem value={BannerSize.LG}>Large (Hero Slider)</SelectItem>
                    <SelectItem value={BannerSize.SIDE_BY_SIDE}>Side-by-Side (Text Left, Image Right)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Display Order (Priority on Page)</Label>
                <Select
                  value={String(formData.displayOrder)}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, displayOrder: parseInt(val, 10) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Section (Top)</SelectItem>
                    <SelectItem value="2">2nd Section (Middle)</SelectItem>
                    <SelectItem value="3">3rd Section (Bottom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Auto-Scroll Interval (seconds)</Label>
                <Select
                  value={String(formData.autoScrollInterval || 4000)}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, autoScrollInterval: parseInt(val, 10) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3000">3 Seconds</SelectItem>
                    <SelectItem value="4000">4 Seconds</SelectItem>
                    <SelectItem value="5000">5 Seconds</SelectItem>
                    <SelectItem value="7000">7 Seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-6">
                <Label htmlFor="sec-active" className="cursor-pointer">Active Status</Label>
                <Switch
                  id="sec-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>

            {/* Slides Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base">Image Slides ({formData.slides.length})</h4>
                  <p className="text-xs text-muted-foreground">
                    Add images with URLs. Images with lower priority numbers display first.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={addSlide}>
                  <Plus className="w-4 h-4 mr-1" /> Add Slide
                </Button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {formData.slides.map((slide, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-xl border border-border bg-card space-y-4 relative"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          Slide #{sIdx + 1}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-semibold">
                          Priority:
                        </span>
                        <Input
                          type="number"
                          min="1"
                          max="99"
                          className="w-16 h-7 text-xs"
                          value={slide.priority}
                          onChange={(e) =>
                            updateSlide(sIdx, 'priority', parseInt(e.target.value, 10) || 1)
                          }
                        />
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-destructive hover:bg-destructive/10"
                        onClick={() => removeSlide(sIdx)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Image URL *</Label>
                        <Input
                          placeholder="https://images.unsplash.com/photo-..."
                          value={slide.imageUrl}
                          onChange={(e) => updateSlide(sIdx, 'imageUrl', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Navigate Link URL</Label>
                        <Input
                          placeholder="/products or https://..."
                          value={slide.navigateLink}
                          onChange={(e) => updateSlide(sIdx, 'navigateLink', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Inside Image Title (Displayed on/next to image)</Label>
                        <Input
                          placeholder="e.g. New Arrivals 2026"
                          value={slide.imageTitle || slide.title || ''}
                          onChange={(e) => {
                            updateSlide(sIdx, 'imageTitle', e.target.value);
                            updateSlide(sIdx, 'title', e.target.value);
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Inside Image Subtitle (Displayed on/next to image)</Label>
                        <Input
                          placeholder="e.g. Premium Collections"
                          value={slide.subtitle || ''}
                          onChange={(e) => updateSlide(sIdx, 'subtitle', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Button Text</Label>
                        <Input
                          placeholder="Shop Now"
                          value={slide.buttonText}
                          onChange={(e) => updateSlide(sIdx, 'buttonText', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Badge Label (Optional)</Label>
                        <Input
                          placeholder="e.g. 50% OFF"
                          value={slide.badge}
                          onChange={(e) => updateSlide(sIdx, 'badge', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditSection(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editSection ? 'Save Changes' : 'Create Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteSection}
        onOpenChange={() => setDeleteSection(null)}
        title="Delete Banner Section"
        description={`Are you sure you want to delete the section "${deleteSection?.title}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
