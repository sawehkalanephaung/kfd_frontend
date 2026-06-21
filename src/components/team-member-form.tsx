'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, User, AlignLeft, Settings, Image as ImageIcon, Building2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

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
  });

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

    const payload = {
      ...formData,
      title: JSON.stringify({ text: formData.title }),
      bio: JSON.stringify({ richText: formData.bio }),
      departmentId: formData.departmentId || null,
    };

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/team-members/${memberId}`, payload);
      } else {
        await api.post('/api/v1/admin/team-members', payload);
      }
      router.push('/dashboard/team');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save team member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Member Details
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g. John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Job Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="e.g. Conservation Director"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  Department
                </label>
                <div className="relative">
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                    disabled={fetchingDepts}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">None / General</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {fetchingDepts && (
                    <div className="absolute right-3 top-3.5">
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio / Rich Text */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-gray-400" />
              Biography (Rich Text)
            </h2>
            <textarea
              rows={6}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Enter member's biography..."
            ></textarea>
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
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <p className="text-xs text-gray-400 mt-2">Determines display order (lower = first)</p>
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              Headshot Image
            </h2>
            <div className="space-y-4">
              {formData.headshotUrl && (
                <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img src={formData.headshotUrl} alt="Headshot Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Headshot URL</label>
                <input
                  type="text"
                  value={formData.headshotUrl}
                  onChange={(e) => setFormData({...formData, headshotUrl: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="https://example.com/headshot.jpg"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
