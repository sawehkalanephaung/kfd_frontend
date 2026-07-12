'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit, Tag as TagIcon, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import SlideOver from '@/components/slide-over';
import TagForm from '@/components/tag-form';
import EmptyState from '@/components/ui/empty-state';

interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function TagsListPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTag, setEditingTag] = useState<any | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/cms/tags');

      const data = response.data?.data || response.data || [];
      console.log('Tags API Response:', data);
      setTags(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load tags. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;

    await api.delete(`/api/v1/admin/cms/tags/${tagToDelete.id}`);
    setTags((prev) => prev.filter((t) => t.id !== tagToDelete.id));
  };

  const openCreateDrawer = () => {
    setIsEditMode(false);
    setEditingTag(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = async (tag: Tag) => {
    setIsEditMode(true);
    setEditingTag(null);
    setDrawerOpen(true);
    setFetchingDetails(true);
    try {
      const res = await api.get(`/api/v1/admin/cms/tags/${tag.id}`);
      setEditingTag(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load tag details');
      setDrawerOpen(false);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleDrawerSuccess = () => {
    setDrawerOpen(false);
    fetchTags();
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Posts & News</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Tags</span>
      </div>

      {/* Header Section */}
      <div className="bg-canvas rounded-lg p-8 shadow-sm border border-hairline-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <TagIcon className="w-6 h-6 text-brand-green" />
            Tags
          </h1>
          <p className="text-steel mt-1">
            Manage tags used to categorize and filter posts.
          </p>
        </div>
        <button
          onClick={openCreateDrawer}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-primary-deep text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create
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
                <th className="px-6 py-4">Tag Name</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading tags...
                  </td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12">
                    <EmptyState 
                      title="No Tags Found"
                      description="Create your first tag to better organize and categorize your posts."
                      icon={TagIcon}
                      actionLabel="Create Tag"
                      onAction={openCreateDrawer}
                    />
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr key={tag.id} className="group hover:bg-surface-soft hover:-translate-y-0.5 hover:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300">
                    <td className="px-6 py-4 font-medium text-ink">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-lg text-sm text-slate">
                        <TagIcon className="w-3.5 h-3.5 text-steel" />
                        {tag.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-steel">
                      {tag.created_at ? new Date(tag.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDrawer(tag)}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-all duration-300 hover:scale-110 hover:rotate-[-5deg]"
                          title="Edit Tag"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(tag)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-6"
                          title="Delete Tag"
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
        title="Delete Tag?"
        description="This will permanently delete the tag. Any posts using this tag will no longer be associated with it."
        itemName={`the '${tagToDelete?.name}' tag`}
      />

      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isEditMode ? 'Edit Tag' : 'Create New Tag'}
      >
        {fetchingDetails ? (
          <div className="flex flex-col items-center justify-center py-20 text-steel">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
            Loading details...
          </div>
        ) : (
          <TagForm
            isEdit={isEditMode}
            initialData={editingTag}
            tagId={editingTag?.id}
            isSlideOver={true}
            onSuccess={handleDrawerSuccess}
            onCancel={() => setDrawerOpen(false)}
          />
        )}
      </SlideOver>
    </div>
  );
}
