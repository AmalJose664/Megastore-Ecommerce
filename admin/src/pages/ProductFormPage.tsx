import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2, Plus, Trash2, Layers } from 'lucide-react';
import { productsService } from '@/services/productsService';
import { categoriesService } from '@/services/categoriesService';
import { ApiProduct, Category, CategoryNode, CreateProductRequest, UpdateProductRequest, IProductVariant } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: '',
    subcategory: '',
    sku: '',
    isActive: true,
    images: [] as string[],
    featured: false,
    isNewProduct: false,
    tags: [] as string[],
    hasVariants: false,
    variants: [] as Array<{
      id?: string;
      size: string;
      color: string;
      sku: string;
      price: string;
      stock: string;
    }>,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
    if (isEditing && id && id !== 'undefined') {
      loadProduct(id);
    }
  }, [id, isEditing]);

  const loadCategories = async () => {
    const tree = await categoriesService.getCategories();
    if (tree) {
      const flattened: Category[] = [];
      const flatten = (nodes: CategoryNode[]) => {
        nodes.forEach(node => {
          const { children, ...category } = node;
          flattened.push(category as Category);
          if (children && children.length > 0) {
            flatten(children);
          }
        });
      };
      flatten(tree);
      setCategories(flattened);
    }
  };

  const loadProduct = async (productId: string) => {
    setIsFetching(true);
    try {
      const product = await productsService.getProductById(productId);
      if (product) {
        const catId = typeof product.category === 'string'
          ? product.category
          : (product.category as any)?._id || (product.category as any)?.id || '';

        const subcatId = typeof product.subcategory === 'string'
          ? product.subcategory
          : (product.subcategory as any)?._id || (product.subcategory as any)?.id || '';

        const formattedVariants = (product.variants || []).map((v: any) => ({
          id: (v._id || v.id)?.toString(),
          size: v.attributes?.size || (typeof v.attributes?.get === 'function' ? v.attributes.get('size') : '') || '',
          color: v.attributes?.color || (typeof v.attributes?.get === 'function' ? v.attributes.get('color') : '') || '',
          sku: v.sku || '',
          price: v.price !== undefined ? String(v.price) : '',
          stock: String(v.stock || 0),
        }));

        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: (product.price || 0).toString(),
          originalPrice: product.originalPrice?.toString() || '',
          stock: (product.stock || 0).toString(),
          category: catId,
          subcategory: subcatId,
          sku: product.sku || '',
          isActive: product.isActive ?? true,
          images: product.images || [],
          featured: product.featured ?? false,
          isNewProduct: product.isNewProduct ?? false,
          tags: product.tags || [],
          hasVariants: product.hasVariants ?? (formattedVariants.length > 0),
          variants: formattedVariants,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Product not found',
          variant: 'destructive',
        });
        navigate('/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const addVariantRow = () => {
    setFormData(prev => ({
      ...prev,
      hasVariants: true,
      variants: [
        ...prev.variants,
        { size: 'M', color: 'Black', sku: `${formData.sku || 'SKU'}-${prev.variants.length + 1}`, price: formData.price, stock: '10' }
      ]
    }));
  };

  const removeVariantRow = (index: number) => {
    setFormData(prev => {
      const updated = prev.variants.filter((_, i) => i !== index);
      return {
        ...prev,
        variants: updated,
        hasVariants: updated.length > 0 ? prev.hasVariants : false
      };
    });
  };

  const updateVariantRow = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.hasVariants && (!formData.stock || parseInt(formData.stock) < 0)) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const formattedVariantsPayload: IProductVariant[] = formData.hasVariants
        ? formData.variants.map((v) => ({
            sku: v.sku.trim() || undefined,
            attributes: {
              ...(v.size ? { size: v.size.trim() } : {}),
              ...(v.color ? { color: v.color.trim() } : {}),
            },
            price: v.price ? parseFloat(v.price) : parseFloat(formData.price),
            stock: parseInt(v.stock) || 0,
          }))
        : [];

      const totalStock = formData.hasVariants
        ? formattedVariantsPayload.reduce((sum, v) => sum + (v.stock || 0), 0)
        : parseInt(formData.stock || '0');

      const payload: CreateProductRequest = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: totalStock,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        sku: formData.sku,
        images: formData.images,
        thumbnail: formData.images[0] || 'https://via.placeholder.com/150',
        featured: formData.featured,
        isNewProduct: formData.isNewProduct,
        tags: formData.tags,
        hasVariants: formData.hasVariants,
        variants: formattedVariantsPayload,
      };

      let result;
      if (isEditing && id) {
        result = await productsService.updateProduct(id, { ...payload, isActive: formData.isActive } as UpdateProductRequest);
      } else {
        result = await productsService.createProduct(payload);
      }

      if (result) {
        toast({
          title: isEditing ? 'Product updated' : 'Product created',
          description: `${formData.name} has been ${isEditing ? 'updated' : 'created'} successfully.`,
        });
        navigate('/products');
      } else {
        toast({
          title: 'Error',
          description: `Failed to ${isEditing ? 'update' : 'create'} product`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = () => {
    const newImage = prompt('Enter image URL:');
    if (newImage) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Edit Product' : 'Add New Product'}
        description={isEditing ? 'Update product information and inventory' : 'Create a new product in your catalog'}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/products')} className="text-xs">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Products
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="card-elevated p-5 space-y-5">
          <h2 className="text-sm font-bold text-foreground">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sku" className="text-xs">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Enter SKU"
                className={errors.sku ? 'border-destructive' : ''}
              />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={4}
              className={errors.description ? 'border-destructive text-xs' : 'text-xs'}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs">Category *</Label>
              <Select
                value={formData.category || undefined}
                onValueChange={value => setFormData(prev => ({ ...prev, category: value, subcategory: '' }))}
              >
                <SelectTrigger className={errors.category ? 'border-destructive text-xs' : 'text-xs'}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {categories
                    .filter(c => !c.parentCategory)
                    .map(category => {
                      const catId = (category._id || category.id)?.toString();
                      if (!catId) return null;
                      return (
                        <SelectItem key={catId} value={catId} className="text-xs">
                          {category.name}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subcategory" className="text-xs">Subcategory</Label>
              <Select
                value={formData.subcategory || "none"}
                onValueChange={value => setFormData(prev => ({ ...prev, subcategory: value === 'none' ? '' : value }))}
                disabled={!formData.category}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="none" className="text-xs">None</SelectItem>
                  {categories
                    .filter(c => {
                      if (!c.parentCategory) return false;
                      const parentId = typeof c.parentCategory === 'object'
                        ? (c.parentCategory as any)._id || (c.parentCategory as any).id
                        : c.parentCategory;
                      return parentId?.toString() === formData.category;
                    })
                    .map(subcategory => {
                      const subId = (subcategory._id || subcategory.id)?.toString();
                      if (!subId) return null;
                      return (
                        <SelectItem key={subId} value={subId} className="text-xs">
                          {subcategory.name}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="card-elevated p-5 space-y-5">
          <h2 className="text-sm font-bold text-foreground">Pricing & Base Stock</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs">Base Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="originalPrice" className="text-xs">Original Price (₹)</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice}
                onChange={e => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                placeholder="0.00 (optional)"
              />
            </div>

            {!formData.hasVariants && (
              <div className="space-y-1.5">
                <Label htmlFor="stock" className="text-xs">Total Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                  className={errors.stock ? 'border-destructive' : ''}
                />
                {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="card-elevated p-5 space-y-5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Product Variants</h2>
                <p className="text-xs text-muted-foreground">Add size, color, or attribute variants with individual stock and price</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hasVariants"
                checked={formData.hasVariants}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, hasVariants: checked }))}
              />
              <Label htmlFor="hasVariants" className="text-xs font-bold">Enable Variants</Label>
            </div>
          </div>

          {formData.hasVariants && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Defined Variants ({formData.variants.length})
                </span>
                <Button type="button" size="sm" onClick={addVariantRow} className="text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Variant
                </Button>
              </div>

              {formData.variants.length === 0 ? (
                <div className="p-5 text-center border border-dashed rounded-xl bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-3">No variants added yet.</p>
                  <Button type="button" variant="outline" size="sm" onClick={addVariantRow} className="text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add First Variant (e.g. Size M, Color Black)
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.variants.map((variant, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-3 p-3 bg-muted/40 rounded-xl items-center border border-border">
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Size</Label>
                        <Input
                          value={variant.size}
                          onChange={e => updateVariantRow(idx, 'size', e.target.value)}
                          placeholder="e.g. S, M, L"
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Color</Label>
                        <Input
                          value={variant.color}
                          onChange={e => updateVariantRow(idx, 'color', e.target.value)}
                          placeholder="e.g. Black"
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Variant SKU</Label>
                        <Input
                          value={variant.sku}
                          onChange={e => updateVariantRow(idx, 'sku', e.target.value)}
                          placeholder="SKU"
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Price (₹)</Label>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={e => updateVariantRow(idx, 'price', e.target.value)}
                          placeholder={formData.price || 'Price'}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Stock *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={e => updateVariantRow(idx, 'stock', e.target.value)}
                          placeholder="0"
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div className="flex justify-end pt-3 sm:pt-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariantRow(idx)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card-elevated p-5 space-y-5">
          <h2 className="text-sm font-bold text-foreground">Images</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleImageUpload}
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs font-medium">Add URL</span>
            </button>
          </div>
        </div>

        <div className="card-elevated p-5 space-y-5">
          <h2 className="text-sm font-bold text-foreground">Product Options</h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured" className="text-xs">Featured Product</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isNewProduct"
                checked={formData.isNewProduct}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isNewProduct: checked }))}
              />
              <Label htmlFor="isNewProduct" className="text-xs">New Arrival</Label>
            </div>
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Product Status</h2>
              <p className="text-xs text-muted-foreground">Make this product visible to customers</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive" className="text-xs">{formData.isActive ? 'Active' : 'Draft'}</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/products')}
            className="text-xs h-9 px-4"
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="text-xs h-9 px-4" disabled={isLoading}>
            {isLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
