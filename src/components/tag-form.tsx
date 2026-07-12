'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface TagFormProps {
  initialData?: any;
  isEdit?: boolean;
  tagId?: string;
  isSlideOver?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TagForm({ initialData, isEdit, tagId, isSlideOver, onSuccess, onCancel }: TagFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
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
        await api.put(`/api/v1/admin/cms/tags/${tagId}`, formData);
        toast.success('Successfully updated tag!');
      } else {
        await api.post('/api/v1/admin/cms/tags', formData);
        toast.success('Successfully created tag!');
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/posts/tags');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save tag.';
      setError(msg);
      toast.error(msg);
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
            href="/dashboard/posts/tags"
            className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tags
          </Link>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Tag'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-canvas rounded-lg p-6 md:p-8 shadow-sm border border-hairline-soft">
        <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-muted" />
          Tag Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Tag Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              placeholder="e.g. Conservation"
            />
          </div>

          <div className="hidden">
            <label className="block text-sm font-semibold text-ink mb-2">URL Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              className="w-full px-4 py-3 bg-surface border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
              placeholder="conservation"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
