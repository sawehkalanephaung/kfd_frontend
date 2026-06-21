'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, FileText, AlignLeft, Settings, Image as ImageIcon, Upload, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
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

  // Form State matching the Page entity
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    heroImageId: initialData?.heroImageId || '',
    status: initialData?.status || 'DRAFT',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);

  // If initialData has a hero image URL, we could set it here if the backend returns it.
  // For now, we only have heroImageId in the form.

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
      heroImageId: formData.heroImageId?.trim() || null,
    };

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/pages/${pageId}`, payload);
      } else {
        await api.post('/api/v1/admin/pages', payload);
      }
      router.push('/dashboard/pages');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save page.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('title', file.name);

    try {
      // Upload directly to the media endpoint
      const res = await api.post('/api/v1/admin/media/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const mediaData = res.data?.data || res.data;
      
      setFormData((prev) => ({ ...prev, heroImageId: mediaData.id }));
      
      // Setup preview
      const previewUrl = mediaData.fileUrl.startsWith('http') 
        ? mediaData.fileUrl 
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${mediaData.fileUrl}`;
      setHeroImagePreview(previewUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
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
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
              <style dangerouslySetInnerHTML={{__html: `
                .ql-editor {
                  color: #000000 !important;
                }
                .ql-editor::before {
                  color: #9ca3af !important;
                }
              `}} />
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                className="h-[400px] border-none"
                placeholder="Write your page content here..."
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                    ['link', 'image', 'video'],
                    ['clean']
                  ],
                }}
              />
            </div>
            {/* Added spacer to account for React Quill height overlap */}
            <div className="h-12"></div>
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Hero Image</label>
                {formData.heroImageId || heroImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video group">
                    {heroImagePreview ? (
                      <img src={heroImagePreview} alt="Hero Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs">Image Assigned (ID: {formData.heroImageId.slice(0, 8)}...)</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, heroImageId: '' });
                          setHeroImagePreview(null);
                        }}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Remove Image"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      {uploadingImage ? (
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-400" />
                      )}
                      <div className="text-sm">
                        <span className="font-semibold text-emerald-600">Click to upload</span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
