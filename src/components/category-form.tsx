'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, FolderTree } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface CategoryFormProps {
  initialData?: any;
  isEdit?: boolean;
  categoryId?: string;
  isSlideOver?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CategoryForm({ initialData, isEdit, categoryId, isSlideOver, onSuccess, onCancel }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: !isEdit ? generateSlug(newName) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/cms/categories/${categoryId}`, formData);
      } else {
        await api.post('/api/v1/admin/cms/categories', formData);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/posts/categories');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Top Bar with Actions */}
      <div className="flex items-center justify-between">
        {!isSlideOver ? (
          <Link
            href="/dashboard/posts/categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Category'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-50">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-gray-400" />
          Category Details
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Category Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g. Wildlife Protection"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">URL Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="wildlife-protection"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Provide a brief description of what this category is about..."
            ></textarea>
          </div>
        </div>
      </div>
    </form>
  );
}
