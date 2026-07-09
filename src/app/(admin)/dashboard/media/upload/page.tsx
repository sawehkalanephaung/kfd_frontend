'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, ArrowLeft, Building2, Tag } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CustomSelect } from '@/components/ui/custom-select';

export default function UploadMediaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lookups
  const [departments, setDepartments] = useState<any[]>([]);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDepartments();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/v1/admin/cms/categories').catch(() => ({ data: [] }));
      const data = res.data?.content || res.data?.data?.content || res.data?.data || res.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/v1/admin/departments').catch(() => ({ data: [] }));
      const data = res.data?.content || res.data?.data?.content || res.data?.data || res.data || [];
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const validateFile = (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be less than 15MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    if (categoryId) formData.append('categoryId', categoryId);
    if (departmentId) formData.append('departmentId', departmentId);

    try {
      await api.post('/api/v1/admin/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Successfully uploaded file!');
      router.push('/dashboard/media');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to upload file.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Upload Media</h1>
        <p className="text-steel mt-1">
          Upload new files, images, or documents to your library.
        </p>
      </div>

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
            disabled={loading || !file}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Upload File
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* File Upload Area */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
              <h2 className="text-lg font-bold text-ink mb-6">Select File</h2>

              <div
                className={`border-2 border-dashed rounded-full p-10 text-center transition-colors cursor-pointer ${file ? 'border-emerald-500 bg-brand-green-soft' : 'border-gray-300 hover:border-emerald-500 hover:bg-surface'
                  }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-brand-green-soft text-brand-green-dark rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-brand-green-dark font-medium text-lg">{file.name}</p>
                    <p className="text-brand-green-dark/70 text-sm mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
                    </p>
                    <p className="text-brand-green-dark text-sm mt-4 underline underline-offset-2">Click or drag to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-surface text-muted rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-slate font-medium text-lg">Click to select or drag and drop</p>
                    <p className="text-steel text-sm mt-1">SVG, PNG, JPG, PDF or MP4 (max. 15MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Area */}
          <div className="space-y-6">
            <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
              <h2 className="text-lg font-bold text-ink mb-6">File Details</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted" />
                    Category
                  </label>
                  <CustomSelect
                    value={categoryId}
                    onChange={(val) => setCategoryId(val)}
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
