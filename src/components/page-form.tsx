'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, FileText, AlignLeft, Settings, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import api, { getMediaUrl } from '@/lib/api';
import MediaSelector from '@/components/media-selector';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { CustomSelect } from '@/components/ui/custom-select';
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
  const [selectorMode, setSelectorMode] = useState<'none' | 'slider' | 'quill-image'>('none');
  const quillRef = useRef<any>(null);

  // Form State matching the Page entity
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    sliderImageIds: initialData?.sliderImageIds?.join(', ') || '',
    status: initialData?.status || 'DRAFT',
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

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: () => {
          setSelectorMode('quill-image');
        }
      }
    }
  }), []);

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
          className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pages
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
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
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted" />
              Page Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Page Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="e.g. About Us"
                />
              </div>

              <div className="hidden">
                <label className="block text-sm font-semibold text-ink mb-2">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-3 bg-surface border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                  placeholder="about-us"
                />
              </div>
            </div>
          </div>

          {/* Content / Rich Text */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-muted" />
              Page Content
            </h2>
            <ReactQuill
              ref={quillRef as any}
              theme="snow"
              value={formData.content}
              onChange={(val) => setFormData({...formData, content: val})}
              modules={modules}
              className="h-[400px] mb-12 text-black"
              placeholder="Enter page content. HTML tags are supported."
            />
          </div>

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
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Status</label>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData({...formData, status: val})}
                  options={[
                    { value: 'PUBLISHED', label: 'Published' },
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'ARCHIVED', label: 'Archived' }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-muted" />
              Media
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2 flex items-center justify-between">
                  Slider Images (Hero Section)
                  {sliderPreviews.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setFormData({...formData, sliderImageIds: ''});
                        setSliderPreviews([]);
                      }} 
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectorMode('slider')}
                    className="flex-1 px-4 py-3 bg-surface border border-hairline-strong rounded-lg text-slate hover:bg-surface transition-colors text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {formData.sliderImageIds ? `${formData.sliderImageIds.split(',').filter((s: string) => s.trim().length > 0).length} Images Selected` : 'Select Slider Images...'}
                    </span>
                    <ImageIcon className="w-4 h-4 text-muted" />
                  </button>
                </div>
                {sliderPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
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
          </div>

          <MediaSelector 
            isOpen={selectorMode !== 'none'} 
            onClose={() => setSelectorMode('none')}
            multiple={selectorMode === 'slider'}
            title={selectorMode === 'quill-image' ? 'Insert Image' : 'Select Slider Images'}
            onSelect={(assets) => {
              if (selectorMode === 'quill-image') {
                const editor = quillRef.current?.getEditor();
                if (editor && assets.length > 0) {
                  const range = editor.getSelection(true);
                  editor.insertEmbed(range.index, 'image', getMediaUrl(assets[0].fileUrl));
                  editor.setSelection(range.index + 1);
                }
              } else if (selectorMode === 'slider') {
                setFormData({...formData, sliderImageIds: assets.map(a => a.id).join(', ')});
                setSliderPreviews(assets.map(a => ({ id: a.id, url: a.fileUrl })));
              }
            }}
          />

        </div>
      </div>
    </form>
  );
}
