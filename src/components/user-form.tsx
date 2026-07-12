'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, UserCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CustomSelect } from '@/components/ui/custom-select';

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
            className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Link>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
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

      <div className="space-y-8">
        <div className="space-y-6">
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-muted" />
              User Information
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
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
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
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                  placeholder="e.g. name@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Password {isEdit && <span className="text-muted font-normal">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!isEdit}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                  placeholder="Enter password"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted" />
              Access Settings
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">System Role</label>
                <div className="relative">
                  <CustomSelect
                    value={formData.roleId}
                    onChange={(val) => setFormData({...formData, roleId: val})}
                    placeholder="Select a role..."
                    disabled={fetchingRoles}
                    options={roles.map((role: any) => {
                      const displayName = role.name?.replace('ROLE_', '').split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                      return { value: role.id.toString(), label: displayName || role.name };
                    })}
                  />
                  {fetchingRoles && (
                    <div className="absolute right-3 top-3.5">
                      <Loader2 className="w-4 h-4 text-muted animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Language</label>
                <CustomSelect
                  value={formData.dashboardLanguage}
                  onChange={(val) => setFormData({...formData, dashboardLanguage: val})}
                  options={[
                    { value: 'en', label: 'English (en)' },
                    { value: 'km', label: 'Khmer (km)' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Status</label>
                <CustomSelect
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(val) => setFormData({...formData, isActive: val === 'true'})}
                  options={[
                    { value: 'true', label: 'Active (Can Login)' },
                    { value: 'false', label: 'Inactive (Suspended)' }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
