'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, Shield, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FormField } from '@/components/ui/form-field';

interface RoleFormProps {
  initialData?: any;
  isEdit?: boolean;
  roleId?: string;
  isSlideOver?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_users', label: 'Manage Users', description: 'Create, edit, and delete system users and roles.' },
  { id: 'manage_content', label: 'Manage Content', description: 'Create, edit, and publish pages, FAQs, and posts.' },
  { id: 'view_analytics', label: 'View Analytics', description: 'Access dashboard metrics and reports.' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'Modify global system settings and configurations.' },
];

export default function RoleForm({ initialData, isEdit, roleId, isSlideOver, onSuccess, onCancel }: RoleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  let initialPermsObj: Record<string, boolean> = {};
  if (initialData?.permissions) {
    try {
      const parsed = typeof initialData.permissions === 'string' ? JSON.parse(initialData.permissions) : initialData.permissions;
      if (Array.isArray(parsed)) {
         parsed.forEach(p => { initialPermsObj[p] = true; });
      } else if (typeof parsed === 'object' && parsed !== null) {
         initialPermsObj = parsed;
      }
    } catch {
      // Keep empty if parsing fails
    }
  }

  const formatForDisplay = (name: string) => {
    if (!name) return '';
    return name.replace('ROLE_', '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const [formData, setFormData] = useState({
    name: formatForDisplay(initialData?.name || ''),
    description: initialData?.description || '',
    permissions: initialPermsObj,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formattedName = formData.name.toUpperCase().startsWith('ROLE_') 
      ? formData.name.toUpperCase().replace(/\s+/g, '_')
      : `ROLE_${formData.name.toUpperCase().trim().replace(/\s+/g, '_')}`;

    const payload = {
      name: formattedName,
      description: formData.description,
      permissions: JSON.stringify(formData.permissions),
    };

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/roles/${roleId}`, payload);
        toast.success('Successfully updated role!');
      } else {
        await api.post('/api/v1/admin/roles', payload);
        toast.success('Successfully created role!');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/team/roles');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save role.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permId]: !prev.permissions[permId]
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        {!isSlideOver ? (
          <Link
            href="/dashboard/team/roles"
            className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Roles
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
          {isEdit ? 'Save Changes' : 'Create Role'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
        <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-muted" />
          Role Information
        </h2>
        
        <div className="space-y-6">
          <FormField label="Role Name" required hint="Recommended format: uppercase, prefixed with ROLE_">
            {(fieldProps) => (
              <input
                {...fieldProps}
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                placeholder="e.g. ROLE_EDITOR"
              />
            )}
          </FormField>

          <FormField label="Description">
            {(fieldProps) => (
              <textarea
                {...fieldProps}
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                placeholder="What can this role do?"
              ></textarea>
            )}
          </FormField>

          <div className="pt-2">
            <label className="block text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-muted" />
              Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <label 
                  key={perm.id} 
                  className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    formData.permissions[perm.id] 
                      ? 'border-brand-green/50 bg-brand-green/5' 
                      : 'border-hairline-soft hover:bg-surface/50'
                  }`}
                >
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={!!formData.permissions[perm.id]}
                      onChange={() => togglePermission(perm.id)}
                      className="peer appearance-none w-5 h-5 border border-hairline-strong rounded bg-canvas checked:bg-brand-green checked:border-brand-green transition-colors cursor-pointer"
                    />
                    <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink leading-tight">{perm.label}</div>
                    <div className="text-xs text-muted mt-1 leading-snug">{perm.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
