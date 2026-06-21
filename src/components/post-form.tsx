'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, FileText, AlignLeft, Settings, ImageIcon, Tag as TagIcon, FolderTree } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface PostFormProps {
  initialData?: any;
  isEdit?: boolean;
  postId?: string;
}

export default function PostForm({ initialData, isEdit, postId }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Lookups
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  // Form State matching PostRequestDto
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featuredImageUrl: initialData?.featuredImageUrl || '',
    categoryId: initialData?.category?.id || '',
    tagIds: initialData?.tags?.map((t: any) => t.id) || [],
    status: initialData?.status || 'DRAFT',
  });

  useEffect(() => {
    fetchCategoriesAndTags();
  }, []);

  const fetchCategoriesAndTags = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        api.get('/api/v1/admin/cms/categories').catch(() => ({ data: [] })),
        api.get('/api/v1/admin/cms/tags').catch(() => ({ data: [] }))
      ]);
      setCategories(catRes.data?.data || catRes.data || []);
      setTags(tagRes.data?.data || tagRes.data || []);
    } catch (err) {
      console.error('Failed to load categories or tags', err);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: !isEdit ? generateSlug(newTitle) : prev.slug,
    }));
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => {
      const isSelected = prev.tagIds.includes(tagId);
      if (isSelected) {
        return { ...prev, tagIds: prev.tagIds.filter((id: string) => id !== tagId) };
      } else {
        return { ...prev, tagIds: [...prev.tagIds, tagId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...formData,
      categoryId: formData.categoryId || null,
      featuredImageUrl: formData.featuredImageUrl?.trim() || null,
    };

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/cms/posts/${postId}`, payload);
      } else {
        await api.post('/api/v1/admin/cms/posts', payload);
      }
      router.push('/dashboard/posts');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar with Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Posts
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Post'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Post Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g. New Forest Conservation Initiative"
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
                  placeholder="new-forest-conservation"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Excerpt</label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="A short summary of the post..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Content / Rich Text */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-gray-400" />
              Post Content
            </h2>
            <textarea
              rows={15}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Enter full post content..."
            ></textarea>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Settings Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              Settings
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Classification Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-gray-400" />
              Classification
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-gray-400" />
                  Tags
                </label>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag: any) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          formData.tagIds.includes(tag.id)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No tags available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              Featured Media
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Featured Image URL</label>
                <input
                  type="text"
                  value={formData.featuredImageUrl}
                  onChange={(e) => setFormData({...formData, featuredImageUrl: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-400 mt-2">Optional external or library image URL</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
