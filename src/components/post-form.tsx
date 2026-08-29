'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, FileText, AlignLeft, Settings, ImageIcon, Tag as TagIcon, FolderTree, ChevronDown, X, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api, { getMediaUrl } from '@/lib/api';
import MediaSelector from '@/components/media-selector';
import ImageUploadField from '@/components/image-upload-field';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { CustomSelect } from '@/components/ui/custom-select';
import { FormField } from '@/components/ui/form-field';

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
          className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Posts
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
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
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted" />
              Post Details
            </h2>
            <div className="space-y-5">
              <FormField label="Title" required>
                {(fieldProps) => (
                  <input
                    {...fieldProps}
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="e.g. New Forest Conservation Initiative"
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
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-surface border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                      placeholder="new-forest-conservation"
                    />
                  )}
                </FormField>
              </div>

              <FormField label="Excerpt">
                {(fieldProps) => (
                  <textarea
                    {...fieldProps}
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="A short summary of the post..."
                  ></textarea>
                )}
              </FormField>
            </div>
          </div>

          {/* Content / Rich Text */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-muted" />
              Post Content
            </h2>
            <div className="bg-canvas rounded-xl overflow-hidden border border-hairline-strong focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all text-black">
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
            <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
              <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-muted" />
                {categorySlug === 'event' ? 'Event Details' : 'Announcement Details'}
              </h2>
              <div className="space-y-5">
                {categorySlug === 'event' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField label="Event Date">
                        {(fieldProps) => (
                          <input
                            {...fieldProps}
                            type="date"
                            value={formData.metadata.eventDate || ''}
                            onChange={(e) => handleMetadataChange('eventDate', e.target.value)}
                            className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                          />
                        )}
                      </FormField>
                      <FormField label="Event Time">
                        {(fieldProps) => (
                          <input
                            {...fieldProps}
                            type="time"
                            value={formData.metadata.eventTime || ''}
                            onChange={(e) => handleMetadataChange('eventTime', e.target.value)}
                            className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                          />
                        )}
                      </FormField>
                    </div>
                    <FormField label="Event Location">
                      {(fieldProps) => (
                        <input
                          {...fieldProps}
                          type="text"
                          placeholder="e.g. Main Conference Hall"
                          value={formData.metadata.eventLocation || ''}
                          onChange={(e) => handleMetadataChange('eventLocation', e.target.value)}
                          className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                        />
                      )}
                    </FormField>
                  </>
                )}
                {/* 
                {categorySlug === 'announcement' && (
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">Reference Number</label>
                    <input
                      type="text"
                      placeholder="e.g. KFD-2024-001"
                      value={formData.metadata.referenceNumber || ''}
                      onChange={(e) => handleMetadataChange('referenceNumber', e.target.value)}
                      className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
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
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted" />
              Settings
            </h2>
            <div className="space-y-5">
              <FormField label="Status">
                {(fieldProps) => (
                  <CustomSelect
                    {...fieldProps}
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val })}
                    options={[
                      { value: 'PUBLISHED', label: 'Published' },
                      { value: 'DRAFT', label: 'Draft' },
                      { value: 'ARCHIVED', label: 'Archived' }
                    ]}
                  />
                )}
              </FormField>
            </div>
          </div>

          {/* Classification Card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-muted" />
              Classification
            </h2>
            <div className="space-y-5">
              <FormField label="Category">
                {(fieldProps) => (
                  <CustomSelect
                    {...fieldProps}
                    value={formData.categoryId}
                    onChange={(val) => setFormData({ ...formData, categoryId: val })}
                    placeholder="Select a Category"
                    options={categories.map((cat: any) => ({ value: cat.id.toString(), label: cat.name }))}
                    clearable
                  />
                )}
              </FormField>

              <FormField label="Department (Optional)">
                {(fieldProps) => (
                  <CustomSelect
                    {...fieldProps}
                    value={formData.departmentId}
                    onChange={(val) => setFormData({ ...formData, departmentId: val })}
                    placeholder="Select a Department"
                    options={departments.map((dept: any) => ({ value: dept.id.toString(), label: dept.name }))}
                    clearable
                  />
                )}
              </FormField>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2 flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-muted" />
                  Tags
                </label>
                <div className="relative">
                  <div
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all flex flex-wrap gap-2 items-center cursor-pointer min-h-[50px]"
                    onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                  >
                    {formData.tagIds.length === 0 && <span className="text-muted">Select Tags...</span>}
                    {formData.tagIds.map((id: any) => {
                      const tag = tags.find(t => t.id === id);
                      if (!tag) return null;
                      return (
                        <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-green-soft text-brand-green-dark rounded-full text-sm font-medium border border-brand-green/30">
                          {tag.name}
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleTag(id); }} aria-label={`Remove tag ${tag.name}`} className="text-brand-green hover:text-brand-green-dark">
                            <X className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </span>
                      );
                    })}
                    <div className="ml-auto">
                      <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isTagDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsTagDropdownOpen(false)}
                      ></div>
                      <div className="absolute z-20 w-full mt-1 bg-canvas border border-hairline-strong rounded-lg shadow-card max-h-60 overflow-auto">
                        <ul className="p-4 text-sm font-medium space-y-4">
                          {tags.length === 0 ? (
                            <li className="text-steel text-center">No tags found</li>
                          ) : (
                            tags.map(tag => (
                              <li key={tag.id}>
                                <div 
                                  className="flex items-center cursor-pointer group"
                                  onClick={() => toggleTag(tag.id)}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={formData.tagIds.includes(tag.id)}
                                    readOnly
                                    className="w-4 h-4 border border-hairline-strong rounded-sm bg-surface accent-brand-green cursor-pointer pointer-events-none"
                                  />
                                  <label className="ms-3 text-sm font-medium text-ink group-hover:text-brand-green-dark cursor-pointer transition-colors">
                                    {tag.name}
                                  </label>
                                </div>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-muted" />
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

              <ImageUploadField
                previewUrl={formData.featuredImageUrl?.trim() ? getMediaUrl(formData.featuredImageUrl) : null}
                uploading={uploadingImage}
                onUploadClick={() => fileInputRef.current?.click()}
                onLibraryClick={() => setIsMediaSelectorOpen(true)}
                onRemoveClick={() => setFormData({ ...formData, featuredImageUrl: '' })}
                alt="Featured preview"
                emptyLabel="No featured image selected"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Slider Images Card (Bottom) */}
      <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft mb-6">
        <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-muted" />
          Slider Images (Optional Gallery)
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-steel">
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
              className="px-5 py-2.5 bg-surface hover:bg-gray-200 text-slate text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Select Images from Library
            </button>
          </div>

          {sliderPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {sliderPreviews.map((preview, i) => (
                <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-hairline-strong bg-surface flex items-center justify-center">
                  {preview.url ? (
                    <img src={getMediaUrl(preview.url)} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => {
                        const newPreviews = sliderPreviews.filter(p => p.id !== preview.id);
                        setSliderPreviews(newPreviews);
                        setFormData({...formData, sliderImageIds: newPreviews.map(p => p.id).join(', ')});
                      }}
                      className="bg-canvas text-red-500 p-2 rounded-full hover:bg-red-50 hover:scale-110 transition-transform shadow-sm"
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
