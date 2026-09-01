'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, FolderTree, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import SlideOver from '@/components/slide-over';
import CategoryForm from '@/components/category-form';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  show_in_public: boolean;
  created_at: string;
}

export default function PublicationCategoriesListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/cms/publication-categories');
      const data = response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load categories. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/api/v1/admin/cms/publication-categories/${categoryToDelete.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      toast.success(`"${categoryToDelete.name}" was successfully deleted.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const openCreateDrawer = () => {
    setIsEditMode(false);
    setEditingCategory(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = async (category: Category) => {
    setIsEditMode(true);
    setEditingCategory(null);
    setDrawerOpen(true);
    setFetchingDetails(true);
    try {
      const res = await api.get(`/api/v1/admin/cms/publication-categories/${category.id}`);
      setEditingCategory(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load category details');
      setDrawerOpen(false);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleDrawerSuccess = () => {
    setDrawerOpen(false);
    fetchCategories();
  };

  const handleTogglePublic = async (category: Category) => {
    setTogglingId(category.id);
    const updated = { ...category, show_in_public: !category.show_in_public };
    try {
      await api.put(`/api/v1/admin/cms/publication-categories/${category.id}`, {
        name: category.name,
        slug: category.slug,
        description: category.description,
        show_in_public: updated.show_in_public,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? updated : c))
      );
      toast.success(
        updated.show_in_public
          ? `"${category.name}" is now visible on the public site.`
          : `"${category.name}" is now hidden from the public site.`
      );
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update visibility.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Publications</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Publication Categories</span>
      </div>

      <PageHeader
        icon={FolderTree}
        title="Publication Categories"
        description="Organize your publications into structured topics."
        action={
          <Button onClick={openCreateDrawer}>
            <Plus className="w-5 h-5" />
            ADD
          </Button>
        }
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-canvas rounded-lg shadow-sm border border-hairline-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm text-steel">
            <thead className="bg-surface-soft text-steel font-medium border-b border-hairline">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Public Visibility</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-steel">
                    No categories found. Create your first one to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-4 font-medium text-ink">
                      <div className="truncate">{category.name}</div>
                      <div className="text-xs text-muted font-normal mt-0.5">/{category.slug}</div>
                    </td>

                    <td className="px-6 py-4 text-steel max-w-sm truncate" title={category.description}>
                      {category.description || <span className="italic text-muted">No description</span>}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublic(category)}
                        disabled={togglingId === category.id}
                        title={category.show_in_public ? 'Click to hide from public site' : 'Click to show on public site'}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 disabled:opacity-60 ${
                          category.show_in_public
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {togglingId === category.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : category.show_in_public ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {category.show_in_public ? 'Visible' : 'Hidden'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-steel text-sm">
                      {category.created_at
                        ? new Date(category.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDrawer(category)}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Publication Category?"
        description="This will permanently delete the category. Note: If publications are attached to this category, it may fail depending on database constraints."
        itemName={`the '${categoryToDelete?.name}' category`}
      />

      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isEditMode ? 'Edit Publication Category' : 'Create New Publication Category'}
      >
        {fetchingDetails ? (
          <div className="flex flex-col items-center justify-center py-20 text-steel">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
            Loading details...
          </div>
        ) : (
          <CategoryForm
            isEdit={isEditMode}
            initialData={editingCategory}
            categoryId={editingCategory?.id}
            isSlideOver={true}
            onSuccess={handleDrawerSuccess}
            onCancel={() => setDrawerOpen(false)}
            apiBasePath="/api/v1/admin/cms/publication-categories"
            backHref="/dashboard/publications/categories"
            namePlaceholder="e.g. Reports"
            visibilityHint="When enabled, this category appears in the public publications filter bar."
          />
        )}
      </SlideOver>
    </div>
  );
}
