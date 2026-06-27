'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Building2, Tag, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import api, { getMediaUrl } from '@/lib/api';

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
      if (category) formData.append('category', category);
      if (departmentId) formData.append('departmentId', departmentId);
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
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
        Loading media details...
      </div>
    );
  }

  if (error && !mediaData) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Media not found.'}</p>
        <Link href="/dashboard/media" className="text-red-700 underline mt-4 inline-block">Back to Library</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Media Details</h1>
        <p className="text-gray-500 mt-1">
          Update the file or metadata classification for this asset.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/media"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center relative group">
                {(previewUrl || mediaData.fileType?.startsWith('image/')) ? (
                  <img src={previewUrl || getMediaUrl(mediaData.fileUrl)} alt={mediaData.fileName} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-300" />
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
                <div className="mb-4 bg-emerald-50 p-3 rounded-xl relative">
                  <h3 className="font-semibold text-emerald-900 text-sm break-all pr-6">{file.name}</h3>
                  <p className="text-emerald-700 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB (New File)</p>
                  <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="absolute top-3 right-3 text-emerald-500 hover:text-emerald-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 text-sm break-all">{mediaData.fileName}</h3>
                  <p className="text-gray-500 text-xs mt-1">{mediaData.fileType} • {mediaData.fileSizeKb > 1024 ? (mediaData.fileSizeKb / 1024).toFixed(2) + ' MB' : mediaData.fileSizeKb + ' KB'}</p>
                </>
              )}
              
              {!file && (
                <a 
                  href={getMediaUrl(mediaData.fileUrl)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 block w-full text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  View Current File
                </a>
              )}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 block w-full text-center px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Upload New File
              </button>
            </div>
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-400" />
                Metadata
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. general, logo, campaign"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    Department (Optional)
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">None / General</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
