import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CreateHeroRequest, HeroSection } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface HeroFormProps {
    formData: CreateHeroRequest;
    setFormData: React.Dispatch<React.SetStateAction<CreateHeroRequest>>;
    editHero: HeroSection | null;
}

export function HeroForm({ formData, setFormData, editHero }: HeroFormProps) {

    useEffect(() => {
        if (editHero) {
            setFormData({
                badge: editHero.badge,
                title: editHero.title,
                subtitle: editHero.subtitle,
                ctaText: editHero.ctaText,
                ctaLink: editHero.ctaLink,
                secondaryCtaText: editHero.secondaryCtaText || '',
                secondaryCtaLink: editHero.secondaryCtaLink || '',
                image: editHero.image,
                stats: editHero.stats || [],
                isActive: editHero.isActive,
            });
        }
    }, [editHero, setFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Stats management
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
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="badge">Badge</Label>
                    <Input
                        id="badge"
                        name="badge"
                        value={formData.badge}
                        onChange={handleChange}
                        placeholder="e.g. Summer Sale 2024"
                        required
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/hero.jpg"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="ctaText">Primary CTA Text</Label>
                    <Input
                        id="ctaText"
                        name="ctaText"
                        value={formData.ctaText}
                        onChange={handleChange}
                        placeholder="e.g. Shop Sale"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="ctaLink">Primary CTA Link</Label>
                    <Input
                        id="ctaLink"
                        name="ctaLink"
                        value={formData.ctaLink}
                        onChange={handleChange}
                        placeholder="e.g. /products?category=summer"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="secondaryCtaText">Secondary CTA Text (Optional)</Label>
                    <Input
                        id="secondaryCtaText"
                        name="secondaryCtaText"
                        value={formData.secondaryCtaText}
                        onChange={handleChange}
                        placeholder="e.g. View Lookbook"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="secondaryCtaLink">Secondary CTA Link (Optional)</Label>
                    <Input
                        id="secondaryCtaLink"
                        name="secondaryCtaLink"
                        value={formData.secondaryCtaLink}
                        onChange={handleChange}
                        placeholder="e.g. /lookbook"
                    />
                </div>
            </div>

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
                            placeholder="Label (e.g. New Styles)"
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
