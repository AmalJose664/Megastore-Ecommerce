import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { productsService } from '@/services/productsService';
import { ApiProduct } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteProduct, setDeleteProduct] = useState<ApiProduct | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productsService.getProducts();
      if (response?.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteProduct) {
      try {
        const success = await productsService.deleteProduct(deleteProduct._id);
        if (success) {
          setProducts(products.filter(p => p._id !== deleteProduct._id));
          toast({
            title: 'Product deleted',
            description: `${deleteProduct.name} has been deleted.`,
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to delete product',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete product',
          variant: 'destructive',
        });
      } finally {
        setDeleteProduct(null);
      }
    }
  };

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (item: { id: string } & ApiProduct) => (
        <div className="flex items-center gap-3">
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: { id: string } & ApiProduct) => (
        <span className="text-sm">
          {typeof item.category === 'object' ? (item.category as any).name : 'No Category'}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (item: { id: string } & ApiProduct) => (
        <div>
          {item.originalPrice && item.originalPrice > item.price ? (
            <>
              <p className="font-medium">${item.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground line-through">
                ${item.originalPrice.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="font-medium">${item.price.toFixed(2)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item: { id: string } & ApiProduct) => (
        <span className={item.stock === 0 ? 'text-destructive font-medium' : item.stock <= (item.lowStockThreshold || 10) ? 'text-warning font-medium' : ''}>
          {item.stock} units
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: { id: string } & ApiProduct) => (
        <StatusBadge
          status={item.isActive ? 'active' : 'archived'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (item: { id: string } & ApiProduct) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/products/${item._id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteProduct(item)}
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
        title="Products"
        description="Manage your product inventory"
        actions={
          <Button onClick={() => navigate('/products/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          data={products.map(product => ({ ...product, id: product._id }))}
          columns={columns}
          searchKey="_id"
          searchPlaceholder="Search products..."
          emptyMessage="No products found"
        />
      )}

      <ConfirmDialog
        open={!!deleteProduct}
        onOpenChange={() => setDeleteProduct(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
