'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, FolderTree } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

interface CategoryFormProps {
  initialData?: any;
  isEdit?: boolean;
  categoryId?: string;
  isSlideOver?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Admin CRUD endpoint for this category type. */
  apiBasePath?: string;
  /** List page to return to / redirect after a non-slide-over save. */
  backHref?: string;
  namePlaceholder?: string;
  /** Shown under the "Show on Public Site" toggle — names where the category surfaces publicly. */
  visibilityHint?: string;
}

export default function CategoryForm({
  initialData,
  isEdit,
  categoryId,
  isSlideOver,
  onSuccess,
  onCancel,
  apiBasePath = '/api/v1/admin/cms/categories',
  backHref = '/dashboard/posts/categories',
  namePlaceholder = 'e.g. Wildlife Protection',
  visibilityHint = 'When enabled, this category appears in the public news filter bar.',
}: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    show_in_public: initialData?.show_in_public !== undefined ? initialData.show_in_public : true,
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
        await api.put(`${apiBasePath}/${categoryId}`, formData);
        toast.success('Successfully updated category!');
      } else {
        await api.post(apiBasePath, formData);
        toast.success('Successfully created category!');
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(backHref);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save category.';
      setError(msg);
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
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
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
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Category'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-canvas rounded-lg p-6 md:p-8 shadow-sm border border-hairline-soft">
        <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-muted" />
          Category Details
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Category Name" required>
              {(fieldProps) => (
                <input
                  {...fieldProps}
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder={namePlaceholder}
                />
              )}
            </FormField>

            <div className="hidden">
              <FormField label="URL Slug">
                {(fieldProps) => (
                  <input
                    {...fieldProps}
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-4 py-3 bg-surface border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                    placeholder="wildlife-protection"
                  />
                )}
              </FormField>
            </div>
          </div>

          <FormField label="Description">
            {(fieldProps) => (
              <textarea
                {...fieldProps}
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                placeholder="Provide a brief description of what this category is about..."
              ></textarea>
            )}
          </FormField>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-surface-soft rounded-lg border border-hairline">
            <div>
              <p className="text-sm font-semibold text-ink">Show on Public Site</p>
              <p className="text-xs text-steel mt-0.5">
                {visibilityHint}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, show_in_public: !prev.show_in_public }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 ${
                formData.show_in_public ? 'bg-brand-green' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={formData.show_in_public}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.show_in_public ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
