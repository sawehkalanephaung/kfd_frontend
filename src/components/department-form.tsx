'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, Building2, Contact, AlignLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
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

  // Contact Info State (Stored in body_content as JSON)
  const [contactInfo, setContactInfo] = useState({
    address: '',
    phone: '',
    email: '',
    officeHours: '',
    website: '',
    facebook: '',
    twitter: '',
  });

  // Rich Text Content State
  const [richText, setRichText] = useState('');

  // On Mount, parse the bodyContent if it's edit mode
  useEffect(() => {
    if (initialData?.bodyContent) {
      try {
        const parsed = JSON.parse(initialData.bodyContent);
        if (parsed.richText) setRichText(parsed.richText);
        if (parsed.contact) {
          setContactInfo({
            address: parsed.contact.address || '',
            phone: parsed.contact.phone || '',
            email: parsed.contact.email || '',
            officeHours: parsed.contact.officeHours || '',
            website: parsed.contact.website || '',
            facebook: parsed.contact.socialMedia?.facebook || '',
            twitter: parsed.contact.socialMedia?.twitter || '',
          });
        }
      } catch (e) {
        // If it's not JSON, assume it's just raw rich text
        setRichText(initialData.bodyContent);
      }
    }
  }, [initialData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Prepare JSON payload for bodyContent
    const bodyContentPayload = JSON.stringify({
      richText,
      contact: {
        address: contactInfo.address,
        phone: contactInfo.phone,
        email: contactInfo.email,
        officeHours: contactInfo.officeHours,
        website: contactInfo.website,
        socialMedia: {
          facebook: contactInfo.facebook,
          twitter: contactInfo.twitter,
        }
      }
    });

    const payload = {
      ...formData,
      headMemberId: formData.headMemberId || null, // Convert empty string to null
      logoId: formData.logoId || null,
      heroImageId: formData.heroImageId || null,
      bodyContent: bodyContentPayload,
    };

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/departments/${departmentId}`, payload);
      } else {
        await api.post('/api/v1/admin/departments', payload);
      }
      router.push('/dashboard/organization/departments');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save department.');
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
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Logo ID (Media UUID)</label>
                  <input
                    type="text"
                    value={formData.logoId}
                    onChange={(e) => setFormData({...formData, logoId: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. 123e4567-e89b-12d3..."
                  />
                  <p className="text-xs text-gray-400 mt-2">Enter the UUID from the Media Library</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Hero Image ID (Media UUID)</label>
                  <input
                    type="text"
                    value={formData.heroImageId}
                    onChange={(e) => setFormData({...formData, heroImageId: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. 123e4567-e89b-12d3..."
                  />
                  <p className="text-xs text-gray-400 mt-2">Enter the UUID from the Media Library</p>
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
                <label className="block text-sm font-semibold text-gray-900 mb-2">Social Media</label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={contactInfo.facebook}
                    onChange={(e) => setContactInfo({...contactInfo, facebook: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Facebook URL"
                  />
                  <input
                    type="url"
                    value={contactInfo.twitter}
                    onChange={(e) => setContactInfo({...contactInfo, twitter: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Twitter / X URL"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
