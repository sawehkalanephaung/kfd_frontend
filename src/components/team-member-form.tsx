'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, User, AlignLeft, Settings, Image as ImageIcon, Building2, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import api, { getMediaUrl } from '@/lib/api';
import dynamic from 'next/dynamic';
import MediaSelector from '@/components/media-selector';
import toast from 'react-hot-toast';
import { CustomSelect } from '@/components/ui/custom-select';
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
  });

  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Cropper State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (headshotFile) {
      const url = URL.createObjectURL(headshotFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [headshotFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('File size must be less than 15MB');
        return;
      }
      setError('');
      
      const url = URL.createObjectURL(selectedFile);
      setImageToCrop(url);
      setCropModalOpen(true);
      
      // Reset input so they can select the same file again if they cancel
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], 'headshot-cropped.jpg', { type: 'image/jpeg' });
    setHeadshotFile(file);
    setCropModalOpen(false);
    
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
      setImageToCrop(null);
    }
  };

  const handleCropClose = () => {
    setCropModalOpen(false);
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
      setImageToCrop(null);
    }
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
      };

      if (isEdit) {
        await api.put(`/api/v1/admin/team-members/${memberId}`, payload);
        toast.success('Successfully updated team member!');
      } else {
        await api.post('/api/v1/admin/team-members', payload);
        toast.success('Successfully created team member!');
      }
      router.push('/dashboard/team');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save team member.';
      setError(msg);
      toast.error(msg);
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
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Add Member'}
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
              <User className="w-5 h-5 text-muted" />
              Member Details
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="e.g. John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Job Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                  placeholder="e.g. Conservation Director"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted" />
                  Department
                </label>
                <div className="relative">
                  <CustomSelect
                    value={formData.departmentId}
                    onChange={(val) => setFormData({...formData, departmentId: val})}
                    placeholder="None / General"
                    disabled={fetchingDepts}
                    options={departments.map((dept: any) => ({ value: dept.id.toString(), label: dept.name }))}
                    clearable
                  />
                  {fetchingDepts && (
                    <div className="absolute right-3 top-3.5">
                      <Loader2 className="w-4 h-4 text-muted animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio / Rich Text */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-muted" />
              Biography (Rich Text)
            </h2>
            <ReactQuill
              theme="snow"
              value={formData.bio}
              onChange={(val) => setFormData({...formData, bio: val})}
              className="h-[250px] mb-12 text-black"
              placeholder="Enter member's biography..."
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
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(val) => setFormData({...formData, isActive: val === 'true'})}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                />
              </div>
              
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

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                />
                <p className="text-xs text-muted mt-2">Determines display order (lower = first)</p>
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-muted" />
              Headshot Image
            </h2>
            <div className="space-y-4">
              <div className="w-full aspect-square bg-surface border border-hairline-strong rounded-lg overflow-hidden relative group flex items-center justify-center">
                {(previewUrl || formData.headshotUrl) ? (
                  <img 
                    src={previewUrl || getMediaUrl(formData.headshotUrl)} 
                    alt="Headshot Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-16 h-16 text-muted" />
                )}
                
                {/* Overlay for change/upload */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-canvas text-slate p-3 rounded-full hover:bg-surface hover:scale-110 transition-transform shadow-sm"
                    title={(previewUrl || formData.headshotUrl) ? "Change Image" : "Upload Image"}
                  >
                    <UploadCloud className="w-5 h-5" />
                  </button>
                  {(previewUrl || formData.headshotUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        setHeadshotFile(null);
                        setFormData({...formData, headshotUrl: ''});
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="bg-canvas text-red-500 p-3 rounded-full hover:bg-red-50 hover:scale-110 transition-transform shadow-sm"
                      title="Remove Image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*"
                className="hidden" 
              />
              
              {!previewUrl && !formData.headshotUrl && (
                <p className="text-xs text-steel text-center mt-2">Click the icon to upload a square image.</p>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Cropper Modal */}
      {cropModalOpen && imageToCrop && (
        <ImageCropperModal
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onClose={handleCropClose}
        />
      )}
    </form>
  );
}
