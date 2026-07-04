'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, Building2, Contact, AlignLeft, Settings, Image as ImageIcon, UploadCloud, FolderOpen, Trash2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import api, { getMediaUrl } from '@/lib/api';
import MediaSelector from '@/components/media-selector';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface DepartmentFormProps {
  initialData?: any;
  isEdit?: boolean;
  departmentId?: string;
}

export default function DepartmentForm({ initialData, isEdit, departmentId }: DepartmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    status: initialData?.status || 'ACTIVE',
    orderIndex: initialData?.orderIndex || 0,
    headMemberId: initialData?.headMember?.id || initialData?.headMemberId || '',
    logoId: initialData?.logoId || '',
    heroImageId: initialData?.heroImageId || '',
    bodyContent: '',
  });

  // Contact state — uses the real department_contacts API
  const [contactId, setContactId] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    address: '',
    phone: '',
    email: '',
    officeHours: '',
    website: '',
  });
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);

  const SOCIAL_PLATFORMS = ['Facebook', 'Twitter / X', 'LinkedIn', 'YouTube', 'Instagram', 'TikTok', 'Other'];

  // Rich Text Content State
  const [richText, setRichText] = useState('');

  // Media Preview and Selector States
  const [logoUrl, setLogoUrl] = useState('');
  const [heroUrl, setHeroUrl] = useState('');
  const [isLogoSelectorOpen, setIsLogoSelectorOpen] = useState(false);
  const [isHeroSelectorOpen, setIsHeroSelectorOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  // On Mount, parse the bodyContent rich text
  useEffect(() => {
    if (initialData?.bodyContent) {
      try {
        const parsed = JSON.parse(initialData.bodyContent);
        if (parsed.richText) setRichText(parsed.richText);
      } catch (e) {
        // If it's not JSON, assume it's just raw rich text
        setRichText(initialData.bodyContent);
      }
    }

    // Fetch media URLs for existing IDs
    const fetchMediaUrls = async () => {
      try {
        if (initialData?.logoId) {
          const res = await api.get(`/api/v1/admin/media/${initialData.logoId}`);
          if (res.data?.fileUrl || res.data?.data?.fileUrl) {
            setLogoUrl(res.data.fileUrl || res.data.data.fileUrl);
          }
        }
      } catch (e) { console.error("Failed to load logo", e); }
      
      try {
        if (initialData?.heroImageId) {
          const res = await api.get(`/api/v1/admin/media/${initialData.heroImageId}`);
          if (res.data?.fileUrl || res.data?.data?.fileUrl) {
            setHeroUrl(res.data.fileUrl || res.data.data.fileUrl);
          }
        }
      } catch (e) { console.error("Failed to load hero image", e); }
    };

    fetchMediaUrls();
  }, [initialData]);

  // Fetch existing contacts from the real contacts API
  useEffect(() => {
    if (isEdit && departmentId) {
      const fetchContacts = async () => {
        try {
          const res = await api.get(`/api/v1/admin/departments/${departmentId}/contacts`);
          const contacts = res.data?.data || res.data || [];
          if (Array.isArray(contacts) && contacts.length > 0) {
            const c = contacts[0]; // Use primary contact
            setContactId(c.id);
            setContactInfo({
              address: c.address || '',
              phone: c.phone || '',
              email: c.email || '',
              officeHours: c.officeHours || '',
              website: c.websiteUrl || '',
            });
            // Parse socialLinks JSON string
            if (c.socialLinks) {
              try {
                const parsed = JSON.parse(c.socialLinks);
                if (Array.isArray(parsed)) {
                  const normalized = parsed.map(link => {
                    let p = link.platform;
                    if (p === 'Twitter') p = 'Twitter / X';
                    if (p === 'Linkedin') p = 'LinkedIn';
                    if (p === 'Youtube') p = 'YouTube';
                    return { ...link, platform: p };
                  });
                  setSocialLinks(normalized);
                } else if (typeof parsed === 'object') {
                  // Legacy format: { facebook: "url", twitter: "url" }
                  const converted = Object.entries(parsed)
                    .filter(([, url]) => url)
                    .map(([platform, url]) => {
                      let p = platform.charAt(0).toUpperCase() + platform.slice(1);
                      if (p === 'Twitter') p = 'Twitter / X';
                      if (p === 'Linkedin') p = 'LinkedIn';
                      if (p === 'Youtube') p = 'YouTube';
                      return { platform: p, url: url as string };
                    });
                  setSocialLinks(converted);
                }
              } catch (e) { /* ignore parse error */ }
            }
          }
        } catch (err) {
          console.error('Failed to fetch contacts', err);
        }
      };
      fetchContacts();
    }
  }, [isEdit, departmentId]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get('/api/v1/admin/team-members');
      const data = res.data?.content || res.data?.data || res.data || [];
      setTeamMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load team members', err);
    } finally {
      setFetchingMembers(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: !isEdit ? generateSlug(newName) : prev.slug, // Auto-generate slug only on create
    }));
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingHero(true);

    try {
      const mediaFormData = new FormData();
      mediaFormData.append('file', file);
      
      const uploadRes = await api.post('/api/v1/admin/media/upload', mediaFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = uploadRes.data?.data?.fileUrl || uploadRes.data?.fileUrl;
      const id = uploadRes.data?.data?.id || uploadRes.data?.id;
      
      if (id && url) {
        if (type === 'logo') {
          setFormData(prev => ({ ...prev, logoId: id }));
          setLogoUrl(url);
        } else {
          setFormData(prev => ({ ...prev, heroImageId: id }));
          setHeroUrl(url);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
        if (logoInputRef.current) logoInputRef.current.value = '';
      } else {
        setUploadingHero(false);
        if (heroInputRef.current) heroInputRef.current.value = '';
      }
    }
  };

  const handleMediaSelect = (selectedAssets: any[], type: 'logo' | 'hero') => {
    if (selectedAssets.length > 0) {
      const asset = selectedAssets[0];
      if (type === 'logo') {
        setFormData(prev => ({ ...prev, logoId: asset.id }));
        setLogoUrl(asset.fileUrl);
      } else {
        setFormData(prev => ({ ...prev, heroImageId: asset.id }));
        setHeroUrl(asset.fileUrl);
      }
    }
  };

  const addSocialLink = () => {
    setSocialLinks(prev => [...prev, { platform: 'Facebook', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setSocialLinks(prev => prev.map((link, i) => i === index ? { ...link, [field]: value } : link));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // bodyContent only stores richText now (no contact data)
    const bodyContentPayload = JSON.stringify({ richText });

    const payload = {
      ...formData,
      headMemberId: formData.headMemberId || null,
      logoId: formData.logoId || null,
      heroImageId: formData.heroImageId || null,
      bodyContent: bodyContentPayload,
    };

    try {
      let savedDeptId = departmentId;

      if (isEdit) {
        await api.put(`/api/v1/admin/departments/${departmentId}`, payload);
      } else {
        const createRes = await api.post('/api/v1/admin/departments', payload);
        savedDeptId = createRes.data?.data?.id || createRes.data?.id;
      }

      // Save contact info via the real contacts API
      const hasContactData = contactInfo.email || contactInfo.phone || contactInfo.address || contactInfo.officeHours || contactInfo.website || socialLinks.length > 0;

      if (hasContactData && savedDeptId) {
        const contactPayload = {
          name: formData.name,
          role: 'Primary Contact',
          email: contactInfo.email || null,
          phone: contactInfo.phone || null,
          address: contactInfo.address || null,
          websiteUrl: contactInfo.website || null,
          officeHours: contactInfo.officeHours || null,
          socialLinks: socialLinks.length > 0 ? JSON.stringify(socialLinks.filter(l => l.url)) : null,
          orderIndex: 0,
        };

        if (contactId) {
          // Update existing contact
          await api.put(`/api/v1/admin/departments/contacts/${contactId}`, contactPayload);
        } else {
          // Create new contact
          await api.post(`/api/v1/admin/departments/${savedDeptId}/contacts`, contactPayload);
        }
      }

      toast.success(isEdit ? 'Successfully updated department!' : 'Successfully created department!');
      router.push('/dashboard/organization/departments');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save department.';
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
          href="/dashboard/organization/departments"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Departments
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Department'}
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
              <Building2 className="w-5 h-5 text-gray-400" />
              Department Information
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Department Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g. Survey and Documentation Unit"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="survey-unit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Head of Department</label>
                  <div className="relative">
                    <select
                      value={formData.headMemberId}
                      onChange={(e) => setFormData({...formData, headMemberId: e.target.value})}
                      disabled={fetchingMembers}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    >
                      <option value="">Select a team member...</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name || member.first_name || 'Member'}</option>
                      ))}
                    </select>
                    {fetchingMembers && (
                      <div className="absolute right-3 top-3.5">
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Images / Logos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                {/* Logo Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    Department Logo
                  </label>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={(e) => handleMediaUpload(e, 'logo')}
                    accept="image/*"
                    className="hidden"
                  />
                  {logoUrl ? (
                    <div className="group relative rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 flex flex-col">
                      <img
                        src={getMediaUrl(logoUrl)}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setIsLogoSelectorOpen(true)}
                          className="bg-white text-gray-700 p-3 rounded-full hover:bg-gray-100 hover:scale-110 transition-transform shadow-sm"
                          title="Change Image"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFormData({ ...formData, logoId: '' }); setLogoUrl(''); }}
                          className="bg-white text-red-500 p-3 rounded-full hover:bg-red-50 hover:scale-110 transition-transform shadow-sm"
                          title="Remove Image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 bg-gray-50/50 aspect-square">
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100">
                        {uploadingLogo ? <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /> : <ImageIcon className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex flex-col w-full gap-2">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="w-full py-2 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          {uploadingLogo ? 'Uploading...' : 'Upload Image'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsLogoSelectorOpen(true)}
                          disabled={uploadingLogo}
                          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          Library
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hero Image Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    Hero Background
                  </label>
                  <input
                    type="file"
                    ref={heroInputRef}
                    onChange={(e) => handleMediaUpload(e, 'hero')}
                    accept="image/*"
                    className="hidden"
                  />
                  {heroUrl ? (
                    <div className="group relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50 flex flex-col">
                      <img
                        src={getMediaUrl(heroUrl)}
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setIsHeroSelectorOpen(true)}
                          className="bg-white text-gray-700 p-3 rounded-full hover:bg-gray-100 hover:scale-110 transition-transform shadow-sm"
                          title="Change Image"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFormData({ ...formData, heroImageId: '' }); setHeroUrl(''); }}
                          className="bg-white text-red-500 p-3 rounded-full hover:bg-red-50 hover:scale-110 transition-transform shadow-sm"
                          title="Remove Image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 bg-gray-50/50 aspect-video">
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100">
                        {uploadingHero ? <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /> : <ImageIcon className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex flex-col w-full gap-2">
                        <button
                          type="button"
                          onClick={() => heroInputRef.current?.click()}
                          disabled={uploadingHero}
                          className="w-full py-2 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          {uploadingHero ? 'Uploading...' : 'Upload Image'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsHeroSelectorOpen(true)}
                          disabled={uploadingHero}
                          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          Library
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description / Rich Text */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-gray-400" />
              Description (Rich Text)
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
                value={richText}
                onChange={(content) => setRichText(content)}
                className="h-[400px] border-none"
                placeholder="Enter department description..."
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
            {/* Spacer for React Quill overlap */}
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
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Order Index</label>
                <input
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({...formData, orderIndex: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <p className="text-xs text-gray-400 mt-2">Determines display order (lower = first)</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Contact className="w-5 h-5 text-gray-400" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="contact@dept.org"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                <input
                  type="text"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
                <textarea
                  rows={2}
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="123 Office St."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Office Hours</label>
                <input
                  type="text"
                  value={contactInfo.officeHours}
                  onChange={(e) => setContactInfo({...contactInfo, officeHours: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Mon-Fri, 9am - 5pm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Website</label>
                <input
                  type="url"
                  value={contactInfo.website}
                  onChange={(e) => setContactInfo({...contactInfo, website: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="https://example.com"
                />
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900">Social Media Links</label>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Link
                  </button>
                </div>
                <div className="space-y-3">
                  {socialLinks.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">No social media links added yet.</p>
                  )}
                  {socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        className="w-32 shrink-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      >
                        {SOCIAL_PLATFORMS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <MediaSelector
        isOpen={isLogoSelectorOpen}
        onClose={() => setIsLogoSelectorOpen(false)}
        onSelect={(assets) => handleMediaSelect(assets, 'logo')}
        multiple={false}
        title="Select Department Logo"
      />

      <MediaSelector
        isOpen={isHeroSelectorOpen}
        onClose={() => setIsHeroSelectorOpen(false)}
        onSelect={(assets) => handleMediaSelect(assets, 'hero')}
        multiple={false}
        title="Select Hero Background Image"
      />
    </form>
  );
}
