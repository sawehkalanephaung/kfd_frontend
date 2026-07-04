'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, FileText, AlignLeft, Settings, ImageIcon, Tag as TagIcon, FolderTree, ChevronDown, X, UploadCloud, FolderOpen, Trash2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api, { getMediaUrl } from '@/lib/api';
import MediaSelector from '@/components/media-selector';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
  const [departments, setDepartments] = useState<any[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // Media Widget State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [isSliderSelectorOpen, setIsSliderSelectorOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State matching PostRequestDto
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featuredImageUrl: initialData?.featuredImageUrl || '',
    categoryId: initialData?.category?.id || '',
    departmentId: initialData?.department?.id || initialData?.departmentId || '',
    sliderImageIds: initialData?.sliderImageIds?.join(', ') || '',
    tagIds: initialData?.tags?.map((t: any) => t.id) || [],
    status: initialData?.status || 'DRAFT',
    metadata: initialData?.metadata || {},
  });

  const [sliderPreviews, setSliderPreviews] = useState<{id: string, url: string}[]>(() => {
    if (initialData?.sliderImageIds && initialData?.sliderImageUrls) {
      return initialData.sliderImageIds.map((id: string, i: number) => ({
        id,
        url: initialData.sliderImageUrls[i] || ''
      }));
    }
    return [];
  });

  useEffect(() => {
    fetchCategoriesAndTags();
  }, []);

  const fetchCategoriesAndTags = async () => {
    try {
      const [catRes, tagRes, deptRes] = await Promise.all([
        api.get('/api/v1/admin/cms/categories').catch(() => ({ data: [] })),
        api.get('/api/v1/admin/cms/tags').catch(() => ({ data: [] })),
        api.get('/api/v1/admin/departments').catch(() => ({ data: [] }))
      ]);
      setCategories(catRes.data?.data || catRes.data || []);
      setTags(tagRes.data?.data || tagRes.data || []);
      
      const deptData = deptRes.data?.content || deptRes.data?.data || deptRes.data;
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err) {
      console.error('Failed to load categories, tags, or departments', err);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size must be less than 15MB');
      return;
    }

    try {
      setUploadingImage(true);
      const mediaFormData = new FormData();
      mediaFormData.append('file', file);

      const uploadRes = await api.post('/api/v1/admin/media/upload', mediaFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = uploadRes.data?.data?.fileUrl || uploadRes.data?.fileUrl;
      if (url) {
        setFormData(prev => ({ ...prev, featuredImageUrl: url }));
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMediaSelect = (selectedAssets: any[]) => {
    if (selectedAssets.length > 0) {
      setFormData(prev => ({ ...prev, featuredImageUrl: selectedAssets[0].fileUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...formData,
      categoryId: formData.categoryId || null,
      departmentId: formData.departmentId || null,
      featuredImageUrl: formData.featuredImageUrl?.trim() || null,
      sliderImageIds: formData.sliderImageIds ? formData.sliderImageIds.split(',').map((id: string) => id.trim()).filter(Boolean) : [],
    };

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/cms/posts/${postId}`, payload);
        toast.success('Successfully updated post!');
      } else {
        await api.post('/api/v1/admin/cms/posts', payload);
        toast.success('Successfully created post!');
      }
      router.push('/dashboard/posts');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save post.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMetadataChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value
      }
    }));
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const categorySlug = selectedCategory?.slug?.toLowerCase();

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
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="new-forest-conservation"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Excerpt</label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
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
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all text-black">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
                className="h-[350px] mb-10 text-black"
                placeholder="Enter full post content..."
              />
            </div>
          </div>

          {/* Conditional Metadata Fields */}
          {(categorySlug === 'event' /* || categorySlug === 'announcement' */) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                {categorySlug === 'event' ? 'Event Details' : 'Announcement Details'}
              </h2>
              <div className="space-y-5">
                {categorySlug === 'event' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Event Date</label>
                        <input
                          type="date"
                          value={formData.metadata.eventDate || ''}
                          onChange={(e) => handleMetadataChange('eventDate', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Event Time</label>
                        <input
                          type="time"
                          value={formData.metadata.eventTime || ''}
                          onChange={(e) => handleMetadataChange('eventTime', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Event Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Main Conference Hall"
                        value={formData.metadata.eventLocation || ''}
                        onChange={(e) => handleMetadataChange('eventLocation', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </>
                )}
                {/* 
                {categorySlug === 'announcement' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Reference Number</label>
                    <input
                      type="text"
                      placeholder="e.g. KFD-2024-001"
                      value={formData.metadata.referenceNumber || ''}
                      onChange={(e) => handleMetadataChange('referenceNumber', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                )} 
                */}
              </div>
            </div>
          )}

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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Department (Optional)</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="">Select a Department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-gray-400" />
                  Tags
                </label>
                <div className="relative">
                  <div
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all flex flex-wrap gap-2 items-center cursor-pointer min-h-[50px]"
                    onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                  >
                    {formData.tagIds.length === 0 && <span className="text-gray-400">Select Tags...</span>}
                    {formData.tagIds.map((id: any) => {
                      const tag = tags.find(t => t.id === id);
                      if (!tag) return null;
                      return (
                        <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                          {tag.name}
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleTag(id); }} className="text-emerald-500 hover:text-emerald-700">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                    <div className="ml-auto">
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isTagDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsTagDropdownOpen(false)}
                      ></div>
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto py-2">
                        {tags.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">No tags found</div>
                        ) : (
                          tags.map(tag => (
                            <div
                              key={tag.id}
                              className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer flex items-center gap-3 transition-colors"
                              onClick={() => toggleTag(tag.id)}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.tagIds.includes(tag.id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                {formData.tagIds.includes(tag.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className="text-sm text-gray-700 font-medium">{tag.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {formData.featuredImageUrl && formData.featuredImageUrl.trim().length > 0 ? (
                <div className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <img
                    src={getMediaUrl(formData.featuredImageUrl)}
                    alt="Featured preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL'; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setIsMediaSelectorOpen(true)}
                      className="bg-white text-gray-700 p-3 rounded-full hover:bg-gray-100 hover:scale-110 transition-transform shadow-sm"
                      title="Change Image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, featuredImageUrl: '' })}
                      className="bg-white text-red-500 p-3 rounded-full hover:bg-red-50 hover:scale-110 transition-transform shadow-sm"
                      title="Remove Image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-gray-50/50">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100">
                    {uploadingImage ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /> : <ImageIcon className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">No featured image selected</p>
                    <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Upload an image or choose one from your library.</p>
                  </div>
                  <div className="flex flex-col w-full gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full py-2.5 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMediaSelectorOpen(true)}
                      disabled={uploadingImage}
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Choose from Library
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Slider Images Card (Bottom) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-gray-400" />
          Slider Images (Optional Gallery)
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Add multiple images to display them as a gallery or slider on the public post page.
            </p>
            {sliderPreviews.length > 0 && (
              <button 
                type="button" 
                onClick={() => {
                  setFormData({...formData, sliderImageIds: ''});
                  setSliderPreviews([]);
                }} 
                className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 rounded-lg transition-colors"
              >
                Clear All Images
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSliderSelectorOpen(true)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Select Images from Library
            </button>
          </div>

          {sliderPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {sliderPreviews.map((preview, i) => (
                <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                  {preview.url ? (
                    <img src={getMediaUrl(preview.url)} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => {
                        const newPreviews = sliderPreviews.filter(p => p.id !== preview.id);
                        setSliderPreviews(newPreviews);
                        setFormData({...formData, sliderImageIds: newPreviews.map(p => p.id).join(', ')});
                      }}
                      className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 hover:scale-110 transition-transform shadow-sm"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={handleMediaSelect}
        multiple={false}
        title="Select Featured Image"
      />
      <MediaSelector
        isOpen={isSliderSelectorOpen}
        onClose={() => setIsSliderSelectorOpen(false)}
        multiple={true}
        title="Select Slider Images"
        onSelect={(assets) => {
          setFormData({...formData, sliderImageIds: assets.map(a => a.id).join(', ')});
          setSliderPreviews(assets.map(a => ({ id: a.id, url: a.fileUrl })));
        }}
      />
    </form>
  );
}
