import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, FolderTree } from 'lucide-react';
import { Category, CategoryNode } from '@/types';
import { categoriesService } from '@/services/categoriesService';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [isLoading, setIsLoading] = useState(true);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '' as string,
    displayOrder: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    const tree = await categoriesService.getCategories();
    if (tree) {
      // Flatten the tree for the DataTable
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
    setIsLoading(false);
  };

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

    if (editCategory) {
      const updated = await categoriesService.updateCategory(editCategory._id, payload);
      if (updated) {
        toast({ title: 'Category updated', description: `${formData.name} has been updated.` });
        setEditCategory(null);
        fetchCategories();
      } else {
        toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
      }
    } else {
      const created = await categoriesService.createCategory(payload);
      if (created) {
        toast({ title: 'Category created', description: `${formData.name} has been created.` });
        setIsCreateOpen(false);
        fetchCategories();
      } else {
        toast({ title: 'Error', description: 'Failed to create category', variant: 'destructive' });
      }
    }
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteCategory) {
      const success = await categoriesService.deleteCategory(deleteCategory._id);
      if (success) {
        toast({ title: 'Category deleted', description: `${deleteCategory.name} has been deleted.` });
        fetchCategories();
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
        const parent = categories.find(c => c._id === category.parentCategory);
        return <span className="text-sm">{parent ? parent.name : 'Root'}</span>;
      },
    },
    {
      key: 'displayOrder',
      header: 'Order',
      render: (category: Category) => (
        <span className="text-sm">{category.displayOrder}</span>
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your products into categories"
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
        rowKey="_id"
        searchKey="name"
        searchPlaceholder="Search categories..."
        emptyMessage={isLoading ? "Loading categories..." : "No categories found"}
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
            categories={categories}
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
            categories={categories}
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
