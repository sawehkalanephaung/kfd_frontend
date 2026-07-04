'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, FileText, AlignLeft, Settings, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import api, { getMediaUrl } from '@/lib/api';
import MediaSelector from '@/components/media-selector';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface PageFormProps {
  initialData?: any;
  isEdit?: boolean;
  pageId?: string;
}

export default function PageForm({ initialData, isEdit, pageId }: PageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectorMode, setSelectorMode] = useState<'none' | 'slider'>('none');

  // Form State matching the Page entity
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    sliderImageIds: initialData?.sliderImageIds?.join(', ') || '',
    status: initialData?.status || 'DRAFT',
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: !isEdit ? generateSlug(newTitle) : prev.slug, // Auto-generate slug only on create
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...formData,
      sliderImageIds: formData.sliderImageIds.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
    };

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/pages/${pageId}`, payload);
        toast.success('Successfully updated page!');
      } else {
        await api.post('/api/v1/admin/pages', payload);
        toast.success('Successfully created page!');
      }
      router.push('/dashboard/pages');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save page.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar with Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pages
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Page'}
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
              Page Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Page Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g. About Us"
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
                  placeholder="about-us"
                />
              </div>
            </div>
          </div>

          {/* Content / Rich Text */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-gray-400" />
              Page Content
            </h2>
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(val) => setFormData({...formData, content: val})}
              className="h-[400px] mb-12 text-black"
              placeholder="Enter page content. HTML tags are supported."
            />
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

          {/* Media Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              Media
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center justify-between">
                  Slider Images (Hero Section)
                  {formData.sliderImageIds && (
                    <button type="button" onClick={() => setFormData({...formData, sliderImageIds: ''})} className="text-xs text-red-500 hover:text-red-700">Clear</button>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectorMode('slider')}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {formData.sliderImageIds ? `${formData.sliderImageIds.split(',').filter((s: string) => s.trim().length > 0).length} Images Selected` : 'Select Slider Images...'}
                    </span>
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                {formData.sliderImageIds && (
                  <div className="mt-2 flex flex-col gap-1">
                    {formData.sliderImageIds.split(',').filter((s: string) => s.trim().length > 0).map((id: string, i: number) => (
                      <p key={i} className="text-xs text-gray-500 font-mono truncate bg-gray-50 p-2 rounded-lg border border-gray-100">{id.trim()}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <MediaSelector 
            isOpen={selectorMode !== 'none'} 
            onClose={() => setSelectorMode('none')}
            multiple={true}
            title="Select Slider Images"
            onSelect={(assets) => {
              setFormData({...formData, sliderImageIds: assets.map(a => a.id).join(', ')});
            }}
          />

        </div>
      </div>
    </form>
  );
}
