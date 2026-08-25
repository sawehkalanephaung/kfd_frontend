'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, FileText, Settings, ImageIcon, FolderTree, Globe2, Building2 } from 'lucide-react';
import Link from 'next/link';
import api, { getMediaUrl } from '@/lib/api';
import MediaSelector from '@/components/media-selector';
import ImageUploadField from '@/components/image-upload-field';
import DocumentUploadField from '@/components/document-upload-field';
import toast from 'react-hot-toast';
import { CustomSelect } from '@/components/ui/custom-select';

interface PublicationFormProps {
  initialData?: any;
  isEdit?: boolean;
  publicationId?: string;
}

export default function PublicationForm({ initialData, isEdit, publicationId }: PublicationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lookups
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Media Widget State
  const documentInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);
  const [isThumbnailSelectorOpen, setIsThumbnailSelectorOpen] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Form State matching PublicationRequestDto
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    summary: initialData?.summary || '',
    categoryId: initialData?.category?.id || '',
    publishedDate: initialData?.publishedDate || '',
    issuedBy: initialData?.issuedBy || '',
    departmentId: initialData?.departmentId || '',
    language: initialData?.language || 'English',
    referenceNo: initialData?.referenceNo || '',
    documentId: initialData?.documentId || '',
    thumbnailId: initialData?.thumbnailId || '',
    status: initialData?.status || 'DRAFT',
  });

  const [documentFileName, setDocumentFileName] = useState<string | null>(initialData?.documentFileName || null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(initialData?.documentUrl || null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialData?.thumbnailUrl || null);

  useEffect(() => {
    fetchLookups();
  }, []);

  const fetchLookups = async () => {
    try {
      const [catRes, deptRes] = await Promise.all([
        api.get('/api/v1/admin/cms/publication-categories').catch(() => ({ data: [] })),
        api.get('/api/v1/admin/departments').catch(() => ({ data: [] })),
      ]);
      setCategories(catRes.data?.data || catRes.data || []);

      const deptData = deptRes.data?.content || deptRes.data?.data || deptRes.data;
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err) {
      console.error('Failed to load categories or departments', err);
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

  const uploadAsset = async (file: File) => {
    const mediaFormData = new FormData();
    mediaFormData.append('file', file);
    const res = await api.post('/api/v1/admin/media/upload', mediaFormData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be less than 15MB');
      return;
    }

    try {
      setUploadingDocument(true);
      const asset = await uploadAsset(file);
      setFormData(prev => ({ ...prev, documentId: asset.id }));
      setDocumentFileName(asset.fileName);
      setDocumentUrl(asset.fileUrl);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDocument(false);
      if (documentInputRef.current) documentInputRef.current.value = '';
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be less than 15MB');
      return;
    }

    try {
      setUploadingThumbnail(true);
      const asset = await uploadAsset(file);
      setFormData(prev => ({ ...prev, thumbnailId: asset.id }));
      setThumbnailUrl(asset.fileUrl);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload thumbnail.');
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.documentId) {
      setError('A document is required. Upload a file or choose one from the library.');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      categoryId: formData.categoryId || null,
      departmentId: formData.departmentId || null,
      thumbnailId: formData.thumbnailId || null,
    };

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/cms/publications/${publicationId}`, payload);
        toast.success('Successfully updated publication!');
      } else {
        await api.post('/api/v1/admin/cms/publications', payload);
        toast.success('Successfully created publication!');
      }
      router.push('/dashboard/publications');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save publication.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar with Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/publications"
          className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Publications
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Publication'}
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
              Publication Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="e.g. Annual Forestry Impact Report 2026"
                />
              </div>

              <div className="hidden">
                <label className="block text-sm font-semibold text-ink mb-2">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                  placeholder="annual-forestry-impact-report-2026"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Summary</label>
                <textarea
                  rows={4}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="A short summary of what this publication covers..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Issued By</label>
                  <input
                    type="text"
                    value={formData.issuedBy}
                    onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="e.g. Office of the Chief Forester"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Reference No.</label>
                  <input
                    type="text"
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="e.g. KFD-2026-014"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Document Card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted" />
              Document
            </h2>
            <input
              type="file"
              ref={documentInputRef}
              onChange={handleDocumentUpload}
              className="hidden"
            />
            <DocumentUploadField
              fileName={documentFileName}
              fileUrl={documentUrl ? getMediaUrl(documentUrl) : null}
              uploading={uploadingDocument}
              onUploadClick={() => documentInputRef.current?.click()}
              onLibraryClick={() => setIsDocumentSelectorOpen(true)}
              onRemoveClick={() => {
                setFormData({ ...formData, documentId: '' });
                setDocumentFileName(null);
                setDocumentUrl(null);
              }}
              emptyLabel="No document selected"
              emptyHint="Upload the report, gazette, or press release file (PDF or any document type)."
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
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={[
                    { value: 'PUBLISHED', label: 'Published' },
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'ARCHIVED', label: 'Archived' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Published Date</label>
                <input
                  type="date"
                  required
                  value={formData.publishedDate}
                  onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2 flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-muted" />
                  Language
                </label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                  placeholder="e.g. English"
                />
              </div>
            </div>
          </div>

          {/* Classification Card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-muted" />
              Classification
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Category</label>
                <CustomSelect
                  value={formData.categoryId}
                  onChange={(val) => setFormData({ ...formData, categoryId: val })}
                  placeholder="Select a Category"
                  options={categories.map((cat: any) => ({ value: cat.id.toString(), label: cat.name }))}
                  clearable
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted" />
                  Department (Optional)
                </label>
                <CustomSelect
                  value={formData.departmentId}
                  onChange={(val) => setFormData({ ...formData, departmentId: val })}
                  placeholder="Select a Department"
                  options={departments.map((dept: any) => ({ value: dept.id.toString(), label: dept.name }))}
                  clearable
                />
              </div>
            </div>
          </div>

          {/* Thumbnail Card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-muted" />
              Cover Thumbnail (Optional)
            </h2>
            <div className="space-y-4">
              <input
                type="file"
                ref={thumbnailInputRef}
                onChange={handleThumbnailUpload}
                accept="image/*"
                className="hidden"
              />
              <ImageUploadField
                previewUrl={thumbnailUrl ? getMediaUrl(thumbnailUrl) : null}
                uploading={uploadingThumbnail}
                onUploadClick={() => thumbnailInputRef.current?.click()}
                onLibraryClick={() => setIsThumbnailSelectorOpen(true)}
                onRemoveClick={() => {
                  setFormData({ ...formData, thumbnailId: '' });
                  setThumbnailUrl(null);
                }}
                alt="Thumbnail preview"
                emptyLabel="No thumbnail selected"
              />
            </div>
          </div>

        </div>
      </div>

      <MediaSelector
        isOpen={isDocumentSelectorOpen}
        onClose={() => setIsDocumentSelectorOpen(false)}
        onSelect={(assets) => {
          if (assets.length > 0) {
            setFormData(prev => ({ ...prev, documentId: assets[0].id }));
            setDocumentFileName(assets[0].fileName);
            setDocumentUrl(assets[0].fileUrl);
          }
        }}
        multiple={false}
        title="Select Document"
        accept="all"
      />
      <MediaSelector
        isOpen={isThumbnailSelectorOpen}
        onClose={() => setIsThumbnailSelectorOpen(false)}
        onSelect={(assets) => {
          if (assets.length > 0) {
            setFormData(prev => ({ ...prev, thumbnailId: assets[0].id }));
            setThumbnailUrl(assets[0].fileUrl);
          }
        }}
        multiple={false}
        title="Select Thumbnail"
      />
    </form>
  );
}
