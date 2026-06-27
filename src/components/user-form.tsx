'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, UserCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface UserFormProps {
  initialData?: any;
  isEdit?: boolean;
  userId?: string;
  isSlideOver?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UserForm({ initialData, isEdit, userId, isSlideOver, onSuccess, onCancel }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [roles, setRoles] = useState<any[]>([]);
  const [fetchingRoles, setFetchingRoles] = useState(true);

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    password: '', // blank on edit means don't change
    roleId: initialData?.role?.id || initialData?.roleId || '',
    dashboardLanguage: initialData?.dashboardLanguage || 'en',
    isActive: initialData?.isActive ?? true,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/api/v1/admin/roles');
      const data = res.data?.data || res.data || [];
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    } finally {
      setFetchingRoles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password || undefined, // only send if provided
      roleId: formData.roleId || null,
      dashboardLanguage: formData.dashboardLanguage,
      isActive: formData.isActive,
    };

    // If it's edit and password is empty, delete it from payload
    if (isEdit && !payload.password) {
      delete payload.password;
    }

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/users/${userId}`, payload);
        toast.success('Successfully updated user!');
      } else {
        await api.post('/api/v1/admin/users', payload);
        toast.success('Successfully created user!');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/team/users');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save user.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        {!isSlideOver ? (
          <Link
            href="/dashboard/team/users"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Link>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create User'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-gray-400" />
              User Information
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
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="e.g. admin@kfd.org"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Password {isEdit && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!isEdit}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              Access Settings
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">System Role</label>
                <div className="relative">
                  <select
                    required
                    value={formData.roleId}
                    onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                    disabled={fetchingRoles}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">Select a role...</option>
                    {roles.map(role => {
                      const displayName = role.name?.replace('ROLE_', '').split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                      return <option key={role.id} value={role.id}>{displayName || role.name}</option>
                    })}
                  </select>
                  {fetchingRoles && (
                    <div className="absolute right-3 top-3.5">
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Language</label>
                <select
                  value={formData.dashboardLanguage}
                  onChange={(e) => setFormData({...formData, dashboardLanguage: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="en">English (en)</option>
                  <option value="km">Khmer (km)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="true">Active (Can Login)</option>
                  <option value="false">Inactive (Suspended)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
