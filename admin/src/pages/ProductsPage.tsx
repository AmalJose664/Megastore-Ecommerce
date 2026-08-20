import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, MoreVertical, Filter, ArrowUpDown, Download, CheckSquare, Square, FileText } from 'lucide-react';
import { productsService } from '@/services/productsService';
import { categoriesService } from '@/services/categoriesService';
import { ApiProduct, Category, CategoryNode, ProductQueryParams } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportReportPDF } from '@/utils/exportUtils';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteProduct, setDeleteProduct] = useState<ApiProduct | null>(null);

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Filter & Pagination States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatus, setStockStatus] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load Categories for Filter Dropdown
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const tree = await categoriesService.getCategories();
    if (tree) {
      const flattened: Category[] = [];
      const flatten = (nodes: CategoryNode[]) => {
        nodes.forEach(node => {
          const { children, ...cat } = node;
          flattened.push(cat as Category);
          if (children && children.length > 0) {
            flatten(children);
          }
        });
      };
      flatten(tree);
      setCategories(flattened);
    }
  };

  // Load Products from API
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: ProductQueryParams = {
        page,
        limit,
        sort: sortField,
        order: sortOrder,
        search: debouncedSearch || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        stockStatus: stockStatus !== 'all' ? (stockStatus as any) : undefined,
        status: status !== 'all' ? (status as any) : undefined,
      };

      const response = await productsService.getProducts(params);
      if (response?.data) {
        setProducts(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
          setTotalItems(response.pagination.total);
        }
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
  }, [page, limit, sortField, sortOrder, debouncedSearch, selectedCategory, stockStatus, status, toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => (p._id || p.id) as string));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);

    const success = await productsService.bulkDeleteProducts(selectedIds);
    if (success) {
      toast({
        title: 'Bulk Deletion Successful',
        description: `Successfully deleted ${selectedIds.length} selected products.`,
      });
      setSelectedIds([]);
      loadProducts();
    } else {
      toast({
        title: 'Bulk Delete Failed',
        description: 'Failed to delete selected products',
        variant: 'destructive',
      });
    }
    setIsBulkDeleting(false);
    setShowBulkDeleteModal(false);
  };

  // Export Handlers
  const exportProductColumns = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'price', label: 'Price (₹)' },
    { key: 'stock', label: 'Stock Count' },
    { key: 'createdAt', label: 'Created At' },
  ];

  const handleExportCSV = (targetData: ApiProduct[]) => {
    exportToCSV(targetData, 'Products_Report', exportProductColumns);
  };

  const handleExportPDF = (targetData: ApiProduct[]) => {
    exportReportPDF('Product Inventory Report', targetData, exportProductColumns, 'Products_Report');
  };

  const handleDelete = async () => {
    if (deleteProduct) {
      const prodId = deleteProduct._id || deleteProduct.id;
      if (!prodId) return;
      try {
        const success = await productsService.deleteProduct(prodId);
        if (success) {
          toast({
            title: 'Product deleted',
            description: `${deleteProduct.name} has been deleted.`,
          });
          loadProducts();
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
      key: 'select',
      header: () => (
        <button onClick={handleSelectAll} className="p-1 hover:text-primary transition-colors">
          {products.length > 0 && selectedIds.length === products.length ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      ),
      render: (item: ApiProduct) => {
        const id = (item._id || item.id) as string;
        const isChecked = selectedIds.includes(id);
        return (
          <button onClick={() => handleToggleSelect(id)} className="p-1 hover:text-primary transition-colors">
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        );
      },
    },
    {
      key: 'product',
      header: 'Product',
      render: (item: ApiProduct) => (
        <div className="flex items-center gap-3">
          <img
            src={item.images?.[0] || 'https://via.placeholder.com/150'}
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
      render: (item: ApiProduct) => (
        <span className="text-sm font-medium">
          {item.category && typeof item.category === 'object' ? (item.category as any).name : 'No Category'}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (item: ApiProduct) => (
        <div>
          {item.originalPrice && item.originalPrice > item.price ? (
            <>
              <p className="font-medium">₹{item.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground line-through">
                ₹{item.originalPrice.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="font-medium">₹{item.price.toFixed(2)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item: ApiProduct) => (
        <span className={item.stock === 0 ? 'text-destructive font-medium' : item.stock <= (item.lowStockThreshold || 10) ? 'text-warning font-medium' : ''}>
          {item.stock} units
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ApiProduct) => (
        <StatusBadge
          status={item.isActive ? 'active' : 'archived'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (item: ApiProduct) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/products/${item._id || item.id}/edit`)}>
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

  // Filter controls bar
  const filterControls = (
    <div className="flex flex-wrap gap-2 items-center">
      <Select
        value={selectedCategory}
        onValueChange={(val) => { setSelectedCategory(val); setPage(1); }}
      >
        <SelectTrigger className="w-[150px] h-9 text-xs">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => {
            const cid = c._id || c.id;
            return cid ? (
              <SelectItem key={cid} value={cid}>
                {c.name}
              </SelectItem>
            ) : null;
          })}
        </SelectContent>
      </Select>

      <Select
        value={stockStatus}
        onValueChange={(val) => { setStockStatus(val); setPage(1); }}
      >
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Stock Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stocks</SelectItem>
          <SelectItem value="in_stock">In Stock</SelectItem>
          <SelectItem value="low_stock">Low Stock</SelectItem>
          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={(val) => { setStatus(val); setPage(1); }}
      >
        <SelectTrigger className="w-[130px] h-9 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={`${sortField}-${sortOrder}`}
        onValueChange={(val) => {
          const [field, order] = val.split('-');
          setSortField(field);
          setSortOrder(order as 'asc' | 'desc');
          setPage(1);
        }}
      >
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt-desc">Newest First</SelectItem>
          <SelectItem value="createdAt-asc">Oldest First</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="stock-asc">Stock: Low to High</SelectItem>
          <SelectItem value="stock-desc">Stock: High to Low</SelectItem>
          <SelectItem value="name-asc">Name: A to Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const selectedProducts = products.filter((p) => selectedIds.includes((p._id || p.id) as string));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product inventory, perform bulk actions, and export reports"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(products)}
              className="text-xs font-bold gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportPDF(products)}
              className="text-xs font-bold gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> PDF Summary
            </Button>
            <Button onClick={() => navigate('/products/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        }
      />

      {selectedIds.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-destructive" />
            <span className="text-sm font-bold text-foreground">
              {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteModal(true)}
              className="text-xs font-bold uppercase tracking-wider gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Bulk Delete Selected
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(selectedProducts)}
              className="text-xs font-bold"
            >
              Export Selected CSV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      <DataTable
        data={products}
        columns={columns}
        serverSide={true}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={limit}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products by name or SKU..."
        loading={loading}
        filterControls={filterControls}
        emptyMessage="No products found matching your search or filters."
      />

      <ConfirmDialog
        open={!!deleteProduct}
        onOpenChange={() => setDeleteProduct(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={showBulkDeleteModal}
        onOpenChange={setShowBulkDeleteModal}
        title="Bulk Delete Products"
        description={`Are you sure you want to delete ${selectedIds.length} selected products? This action cannot be undone.`}
        confirmLabel={isBulkDeleting ? "Deleting..." : "Confirm Delete"}
        onConfirm={handleConfirmBulkDelete}
        variant="destructive"
      />
    </div>
  );
}
