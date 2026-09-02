'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, User, AlignLeft, Settings, Image as ImageIcon, Building2 } from 'lucide-react';
import Link from 'next/link';
import api, { getMediaUrl } from '@/lib/api';
import dynamic from 'next/dynamic';
import MediaSelector from '@/components/media-selector';
import ImageUploadField from '@/components/image-upload-field';
import toast from 'react-hot-toast';
import { CustomSelect } from '@/components/ui/custom-select';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import 'react-quill-new/dist/quill.snow.css';
import ImageCropperModal from '@/components/image-cropper';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface TeamMemberFormProps {
  initialData?: any;
  isEdit?: boolean;
  memberId?: string;
}

export default function TeamMemberForm({ initialData, isEdit, memberId }: TeamMemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingDepts, setFetchingDepts] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Extract JSON fields
  let initialTitle = '';
  let initialBio = '';
  
  if (initialData) {
    try {
      const parsedTitle = JSON.parse(initialData.title);
      initialTitle = parsedTitle.text || parsedTitle.en || initialData.title || '';
    } catch {
      initialTitle = initialData.title || '';
    }
    
    try {
      const parsedBio = JSON.parse(initialData.bio);
      initialBio = parsedBio.richText || parsedBio.text || initialData.bio || '';
    } catch {
      initialBio = initialData.bio || '';
    }
  }

  // Form State
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    title: initialTitle,
    bio: initialBio,
    departmentId: initialData?.departmentId || '',
    headshotUrl: initialData?.headshotUrl || '',
    displayOrder: initialData?.displayOrder || 0,
    isActive: initialData?.isActive ?? true,
    isKfdChairman: initialData?.isKfdChairman ?? false,
    termStartDate: initialData?.termStartDate || '',
    termEndDate: initialData?.termEndDate || '',
  });

  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  // Cropper State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  /** Stored fileUrl of the library pick, so it can still be applied uncropped
   *  if the browser refuses to let us read the cropped pixels back. */
  const [pendingLibraryUrl, setPendingLibraryUrl] = useState<string | null>(null);

  useEffect(() => {
    if (headshotFile) {
      const url = URL.createObjectURL(headshotFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [headshotFile]);

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], 'headshot-cropped.jpg', { type: 'image/jpeg' });
    setHeadshotFile(file);
    setCropModalOpen(false);
    setImageToCrop(null);
    setPendingLibraryUrl(null);
  };

  const handleCropClose = () => {
    setCropModalOpen(false);
    setImageToCrop(null);
    setPendingLibraryUrl(null);
  };

  /**
   * Reading the crop back out of a canvas is only possible when the browser is
   * allowed to read the source pixels. Media is served from S3 in production
   * (getMediaUrl passes absolute URLs through untouched), so a bucket without
   * CORS headers makes the crop impossible — in that case the asset is applied
   * uncropped, which is what selecting from the library did before cropping
   * was offered here.
   */
  const handleCropUnavailable = () => {
    if (pendingLibraryUrl) {
      setFormData((prev) => ({ ...prev, headshotUrl: pendingLibraryUrl }));
      toast('Cropping isn\'t available for this image — using it as-is.');
    }
    handleCropClose();
  };

  /**
   * Headshots render in a square frame, so a library asset goes through the
   * crop step. The crop becomes a new local file, uploaded on submit like any
   * other freshly-picked one; cancelling leaves the current headshot alone.
   */
  const handleLibrarySelect = (assets: { fileUrl: string }[]) => {
    if (assets.length === 0) return;
    setHeadshotFile(null);
    setPendingLibraryUrl(assets[0].fileUrl);
    setImageToCrop(getMediaUrl(assets[0].fileUrl));
    setCropModalOpen(true);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/v1/admin/departments').catch(() => ({ data: [] }));
      const data = res.data?.content || res.data?.data?.content || res.data?.data || res.data || [];
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load departments', err);
    } finally {
      setFetchingDepts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let finalHeadshotUrl = formData.headshotUrl;

      // 1. Upload new image if selected
      if (headshotFile) {
        const mediaFormData = new FormData();
        mediaFormData.append('file', headshotFile);
        mediaFormData.append('category', 'headshots');
        
        const uploadRes = await api.post('/api/v1/admin/media/upload', mediaFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        finalHeadshotUrl = uploadRes.data?.data?.fileUrl || uploadRes.data?.fileUrl || '';
      }

      // 2. Save team member
      const payload = {
        ...formData,
        headshotUrl: finalHeadshotUrl,
        title: JSON.stringify({ text: formData.title }),
        bio: JSON.stringify({ richText: formData.bio }),
        departmentId: formData.departmentId || null,
        isKfdChairman: formData.isKfdChairman,
        termStartDate: formData.termStartDate || null,
        termEndDate: formData.termEndDate || null,
      };

      if (isEdit) {
        await api.put(`/api/v1/admin/team-members/${memberId}`, payload);
        toast.success('Successfully updated Chairman!');
      } else {
        await api.post('/api/v1/admin/team-members', payload);
        toast.success('Successfully created Chairman!');
      }
      router.push('/dashboard/team');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save Chairman.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Link>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save' : 'Create'}
        </Button>
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
              <User className="w-5 h-5 text-muted" />
              Member Details
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="First Name" required>
                  {(fieldProps) => (
                    <input
                      {...fieldProps}
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                      placeholder="e.g. John"
                    />
                  )}
                </FormField>
                <FormField label="Last Name" required>
                  {(fieldProps) => (
                    <input
                      {...fieldProps}
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                      placeholder="e.g. Doe"
                    />
                  )}
                </FormField>
              </div>

              <FormField label="Job Title" required>
                {(fieldProps) => (
                  <input
                    {...fieldProps}
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                    placeholder="e.g. Conservation Director"
                  />
                )}
              </FormField>

              <FormField
                label={
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted" aria-hidden="true" />
                    Department
                  </span>
                }
              >
                {(fieldProps) => (
                  <div className="relative">
                    <CustomSelect
                      {...fieldProps}
                      value={formData.departmentId}
                      onChange={(val) => setFormData({...formData, departmentId: val})}
                      placeholder="None / General"
                      disabled={fetchingDepts}
                      options={departments.map((dept: any) => ({ value: dept.id.toString(), label: dept.name }))}
                      clearable
                    />
                    {fetchingDepts && (
                      <div className="absolute right-3 top-3.5">
                        <Loader2 className="w-4 h-4 text-muted animate-spin" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                )}
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <FormField label="Term Start Date">
                  {(fieldProps) => (
                    <input
                      {...fieldProps}
                      type="date"
                      value={formData.termStartDate}
                      onChange={(e) => setFormData({...formData, termStartDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                    />
                  )}
                </FormField>
                <FormField label="Term End Date" hint="Leave empty if currently active.">
                  {(fieldProps) => (
                    <input
                      {...fieldProps}
                      type="date"
                      value={formData.termEndDate}
                      onChange={(e) => setFormData({...formData, termEndDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                    />
                  )}
                </FormField>
              </div>
            </div>
          </div>

          {/* Bio / Rich Text */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-muted" />
              Biography (Rich Text)
            </h2>
            <div className="editor-no-highlight">
              <ReactQuill
                theme="snow"
                value={formData.bio}
                onChange={(val) => setFormData({...formData, bio: val})}
                className="h-(--editor-height-sm) mb-12"
                placeholder="Enter member's biography..."
              />
            </div>
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
              <FormField label="Status">
                {(fieldProps) => (
                  <CustomSelect
                    {...fieldProps}
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(val) => setFormData({...formData, isActive: val === 'true'})}
                    options={[
                      { value: 'true', label: 'Active' },
                      { value: 'false', label: 'Inactive' }
                    ]}
                  />
                )}
              </FormField>

              <div>
                <label className="flex items-center gap-3 p-4 bg-surface border border-hairline rounded-xl cursor-pointer hover:bg-surface transition-colors">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isKfdChairman}
                      onChange={(e) => setFormData({...formData, isKfdChairman: e.target.checked})}
                      className="peer sr-only"
                    />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-brand-green peer-focus:ring-2 peer-focus:ring-brand-green/30 transition-all"></div>
                    <div className="absolute left-1 top-1 w-3 h-3 bg-canvas rounded-full peer-checked:translate-x-5 transition-all"></div>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-ink">KFD Chairman</span>
                    <span className="block text-xs text-steel mt-0.5">Flag this person as the KFD Chairman</span>
                  </div>
                </label>
              </div>

              <FormField label="Display Order" hint="Determines display order (lower = first)">
                {(fieldProps) => (
                  <input
                    {...fieldProps}
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                  />
                )}
              </FormField>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-muted" />
              Headshot Image
            </h2>
            <div className="space-y-4">
              <ImageUploadField
                previewUrl={previewUrl || (formData.headshotUrl ? getMediaUrl(formData.headshotUrl) : null)}
                onLibraryClick={() => setIsMediaSelectorOpen(true)}
                onRemoveClick={() => {
                  setHeadshotFile(null);
                  setFormData({ ...formData, headshotUrl: '' });
                }}
                alt="Headshot preview"
                aspect="square"
                emptyIcon={<User className="w-6 h-6 text-muted" />}
                emptyLabel="No headshot selected"
                emptyHint="Choose a square image from your library — you can crop it after picking."
              />
            </div>
          </div>

        </div>
      </div>
      
      {/* Cropper Modal */}
      {cropModalOpen && imageToCrop && (
        <ImageCropperModal
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCropUnavailable={handleCropUnavailable}
          onClose={handleCropClose}
        />
      )}

      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={handleLibrarySelect}
        multiple={false}
        title="Select Headshot Image"
      />
    </form>
  );
}
