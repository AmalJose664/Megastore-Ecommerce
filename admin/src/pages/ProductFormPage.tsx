import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { productsService } from '@/services/productsService';
import { categoriesService } from '@/services/categoriesService';
import { ApiProduct, Category, CategoryNode, CreateProductRequest, UpdateProductRequest } from '@/types';
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
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: (product.price || 0).toString(),
          originalPrice: product.originalPrice?.toString() || '',
          stock: (product.stock || 0).toString(),
          category: typeof product.category === 'string' ? product.category : (product.category as any)?._id || '',
          subcategory: product.subcategory || '',
          sku: product.sku || '',
          isActive: product.isActive ?? true,
          images: product.images || [],
          featured: product.featured ?? false,
          isNewProduct: product.isNewProduct ?? false,
          tags: product.tags || [],
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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';

    if (formData.originalPrice && parseFloat(formData.originalPrice) <= parseFloat(formData.price)) {
      // Logic might vary, but usually original price is higher than current price if there's a discount
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const payload: CreateProductRequest = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        sku: formData.sku,
        images: formData.images,
        thumbnail: formData.images[0] || '',
        featured: formData.featured,
        isNewProduct: formData.isNewProduct,
        tags: formData.tags,
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
    // In a real app, this would be a file upload to S3/Cloudinary
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={isEditing ? 'Edit Product' : 'Add Product'}
        description={isEditing ? 'Update product information' : 'Create a new product listing'}
        actions={
          <Button variant="outline" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card-elevated p-6 space-y-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Enter SKU"
                className={errors.sku ? 'border-destructive' : ''}
              />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={4}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ""}
                onValueChange={value => setFormData(prev => ({ ...prev, category: value, subcategory: '' }))}
              >
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => !c.parentCategory).map(category => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select
                value={formData.subcategory || "none"}
                onValueChange={value => setFormData(prev => ({ ...prev, subcategory: value }))}
                disabled={!formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.filter(c => c.parentCategory === formData.category).map(subcategory => (
                    <SelectItem key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card-elevated p-6 space-y-6">
          <h2 className="text-lg font-semibold">Pricing & Stock</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
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
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price ($)</Label>
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

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
                className={errors.stock ? 'border-destructive' : ''}
              />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock}</p>}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card-elevated p-6 space-y-6">
          <h2 className="text-lg font-semibold">Images</h2>

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
              <Upload className="w-6 h-6" />
              <span className="text-sm">Add URL</span>
            </button>
          </div>
        </div>

        {/* Attributes */}
        <div className="card-elevated p-6 space-y-6">
          <h2 className="text-lg font-semibold">Product Attributes</h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isNewProduct"
                checked={formData.isNewProduct}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isNewProduct: checked }))}
              />
              <Label htmlFor="isNewProduct">New Arrival</Label>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Product Status</h2>
              <p className="text-sm text-muted-foreground">Make this product visible to customers</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/products')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Product' : 'Create Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
