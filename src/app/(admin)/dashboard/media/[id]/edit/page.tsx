'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Images, Building2, Tag, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import api, { getMediaUrl } from '@/lib/api';
import { CustomSelect } from '@/components/ui/custom-select';
import PageHeader from '@/components/page-header';

export default function EditMediaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [mediaData, setMediaData] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [category, setCategory] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  
  // File Update State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mediaRes, deptRes] = await Promise.all([
          api.get(`/api/v1/admin/media/${id}`),
          api.get('/api/v1/admin/departments').catch(() => ({ data: { data: [] } }))
        ]);
        
        const data = mediaRes.data?.data || mediaRes.data;
        setMediaData(data);
        setCategory(data.mediaCategory || '');
        setDepartmentId(data.departmentId || '');
        
        setDepartments(Array.isArray(deptRes.data?.content) ? deptRes.data.content : 
                       Array.isArray(deptRes.data?.data) ? deptRes.data.data : 
                       Array.isArray(deptRes.data) ? deptRes.data : []);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load media details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('File size must be less than 15MB');
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('category', category || '');
      formData.append('departmentId', departmentId || '');
      if (file) formData.append('file', file);

      await api.put(`/api/v1/admin/media/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/dashboard/media');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update media.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-steel">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
        Loading media details...
      </div>
    );
  }

  if (error && !mediaData) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Media not found.'}</p>
        <Link href="/dashboard/media" className="text-red-700 underline mt-4 inline-block">Back to Library</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={Images}
        title="Edit Media Details"
        description="Update the file or metadata classification for this asset."
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/media"
            className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* File Preview Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
              <div className="aspect-square bg-surface rounded-xl overflow-hidden mb-4 flex items-center justify-center relative group">
                {(previewUrl || mediaData.fileType?.startsWith('image/')) ? (
                  <img src={previewUrl || getMediaUrl(mediaData.fileUrl)} alt={mediaData.fileName} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted" />
                )}
                
                {/* File Replace Overlay */}
                <div 
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-8 h-8 text-white mb-2" />
                  <span className="text-white text-sm font-medium">Change File</span>
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />

              {file ? (
                <div className="mb-4 bg-brand-green-soft p-3 rounded-full relative">
                  <h3 className="font-semibold text-emerald-900 text-sm break-all pr-6">{file.name}</h3>
                  <p className="text-brand-green-dark text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB (New File)</p>
                  <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="absolute top-3 right-3 text-brand-green hover:text-brand-green-dark"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-ink text-sm break-all">{mediaData.fileName}</h3>
                  <p className="text-steel text-xs mt-1">{mediaData.fileType} • {mediaData.fileSizeKb > 1024 ? (mediaData.fileSizeKb / 1024).toFixed(2) + ' MB' : mediaData.fileSizeKb + ' KB'}</p>
                </>
              )}
              
              {!file && (
                <a 
                  href={getMediaUrl(mediaData.fileUrl)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 block w-full text-center px-4 py-2 bg-surface hover:bg-gray-200 text-slate text-sm font-medium rounded-lg transition-colors"
                >
                  View Current File
                </a>
              )}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 block w-full text-center px-4 py-2 border border-hairline-strong hover:bg-surface text-slate text-sm font-medium rounded-lg transition-colors"
              >
                Upload New File
              </button>
            </div>
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
              <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-muted" />
                Metadata
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                    placeholder="e.g. general, logo, campaign"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted" />
                    Department (Optional)
                  </label>
                  <CustomSelect
                    value={departmentId}
                    onChange={(val) => setDepartmentId(val)}
                    placeholder="None / General"
                    options={departments.map((dept: any) => ({ value: dept.id.toString(), label: dept.name }))}
                    clearable
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
