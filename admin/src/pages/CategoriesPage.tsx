import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, MoreVertical, FolderTree, Filter, ArrowUpDown } from 'lucide-react';
import { Category, CategoryNode, CategoryQueryParams } from '@/types';
import { categoriesService } from '@/services/categoriesService';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CategoryForm } from '@/components/categories/CategoryForm';

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategoriesList, setAllCategoriesList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Search & Filter & Pagination States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [level, setLevel] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('displayOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '' as string,
    displayOrder: 1,
    isActive: true,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load all categories for select dropdown in forms
  useEffect(() => {
    loadAllCategories();
  }, []);

  const loadAllCategories = async () => {
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
      setAllCategoriesList(flattened);
    }
  };

  // Fetch paginated categories from API
  const fetchPaginatedCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: CategoryQueryParams = {
        page,
        limit,
        sort: sortField,
        order: sortOrder,
        search: debouncedSearch || undefined,
        level: level !== 'all' ? (level as any) : undefined,
        status: status !== 'all' ? (status as any) : undefined,
      };

      const response = await categoriesService.getPaginatedCategories(params);
      if (response?.data) {
        setCategories(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
          setTotalItems(response.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sortField, sortOrder, debouncedSearch, level, status, toast]);

  useEffect(() => {
    fetchPaginatedCategories();
  }, [fetchPaginatedCategories]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentCategory: '',
      displayOrder: 1,
      isActive: true
    });
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      parentCategory: category.parentCategory || '',
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    setEditCategory(category);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      ...formData,
      parentCategory: formData.parentCategory === 'root' || !formData.parentCategory ? null : formData.parentCategory,
    };

    const catId = editCategory?._id || editCategory?.id;
    if (editCategory && catId) {
      const updated = await categoriesService.updateCategory(catId, payload);
      if (updated) {
        toast({ title: 'Category updated', description: `${formData.name} has been updated.` });
        setEditCategory(null);
        fetchPaginatedCategories();
        loadAllCategories();
      } else {
        toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
      }
    } else {
      const created = await categoriesService.createCategory(payload);
      if (created) {
        toast({ title: 'Category created', description: `${formData.name} has been created.` });
        setIsCreateOpen(false);
        fetchPaginatedCategories();
        loadAllCategories();
      } else {
        toast({ title: 'Error', description: 'Failed to create category', variant: 'destructive' });
      }
    }
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteCategory) {
      const catId = deleteCategory._id || deleteCategory.id;
      if (!catId) return;
      const success = await categoriesService.deleteCategory(catId);
      if (success) {
        toast({ title: 'Category deleted', description: `${deleteCategory.name} has been deleted.` });
        fetchPaginatedCategories();
        loadAllCategories();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete category. Check if it has active subcategories.',
          variant: 'destructive'
        });
      }
      setDeleteCategory(null);
    }
  };

  const columns = [
    {
      key: 'category',
      header: 'Category',
      render: (category: Category) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FolderTree className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{category.name}</p>
            <p className="text-sm text-muted-foreground">{category.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Parent',
      render: (category: Category) => {
        const parentId = typeof category.parentCategory === 'object' && category.parentCategory
          ? (category.parentCategory as any)._id || (category.parentCategory as any).id
          : category.parentCategory;
        const parent = allCategoriesList.find(c => (c._id || c.id) === parentId);
        return <span className="text-sm">{parent ? parent.name : 'Root'}</span>;
      },
    },
    {
      key: 'displayOrder',
      header: 'Order',
      render: (category: Category) => (
        <span className="text-sm font-medium">{category.displayOrder}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (category: Category) => <StatusBadge status={category.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (category: Category) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(category)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteCategory(category)}
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
      {/* Level Filter */}
      <Select
        value={level}
        onValueChange={(val) => { setLevel(val); setPage(1); }}
      >
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Category Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="root">Root Categories</SelectItem>
          <SelectItem value="subcategory">Subcategories</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
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
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Options */}
      <Select
        value={`${sortField}-${sortOrder}`}
        onValueChange={(val) => {
          const [field, order] = val.split('-');
          setSortField(field);
          setSortOrder(order as 'asc' | 'desc');
          setPage(1);
        }}
      >
        <SelectTrigger className="w-[150px] h-9 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="displayOrder-asc">Display Order</SelectItem>
          <SelectItem value="name-asc">Name: A to Z</SelectItem>
          <SelectItem value="createdAt-desc">Newest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your products into categories with real-time search & filters"
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        }
      />

      <DataTable
        data={categories}
        columns={columns}
        serverSide={true}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={limit}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search category name or slug..."
        loading={isLoading}
        filterControls={filterControls}
        emptyMessage="No categories found matching your search or filters."
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            categories={allCategoriesList}
            editCategory={null}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            categories={allCategoriesList}
            editCategory={editCategory}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategory(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteCategory?.name}"? This will perform a soft delete.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
