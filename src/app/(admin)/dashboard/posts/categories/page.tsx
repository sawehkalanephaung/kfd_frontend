'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, FolderTree, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import SlideOver from '@/components/slide-over';
import CategoryForm from '@/components/category-form';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export default function CategoriesListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Drawer State
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
      const response = await api.get('/api/v1/admin/cms/categories');

      // Category endpoint returns a direct List<PostCategoryDto>
      const data = response.data?.data || response.data || [];
      console.log('Categories API Response:', data);
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

    await api.delete(`/api/v1/admin/cms/categories/${categoryToDelete.id}`);
    setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
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
      const res = await api.get(`/api/v1/admin/cms/categories/${category.id}`);
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

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Posts & News</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Categories</span>
      </div>

      {/* Header Section */}
      <div className="bg-canvas rounded-lg p-8 shadow-sm border border-hairline-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <FolderTree className="w-6 h-6 text-brand-green" />
            Categories
          </h1>
          <p className="text-steel mt-1">
            Organize your posts and news articles into structured topics.
          </p>
        </div>
        <button
          onClick={openCreateDrawer}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-primary-deep text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          ADD

        </button>
      </div>

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
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-steel">
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
                    <td className="px-6 py-4 text-steel text-sm">
                      {category.created_at ? new Date(category.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDrawer(category)}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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
        title="Delete Category?"
        description="This will permanently delete the category. Note: If posts are attached to this category, it may fail depending on database constraints."
        itemName={`the '${categoryToDelete?.name}' category`}
      />

      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isEditMode ? 'Edit Category' : 'Create New Category'}
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
          />
        )}
      </SlideOver>
    </div>
  );
}
