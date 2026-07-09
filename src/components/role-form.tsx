'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, Shield, AlignLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface RoleFormProps {
  initialData?: any;
  isEdit?: boolean;
  roleId?: string;
  isSlideOver?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RoleForm({ initialData, isEdit, roleId, isSlideOver, onSuccess, onCancel }: RoleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  let initialPerms = '[]';
  if (initialData?.permissions) {
    try {
      // Format it nicely
      initialPerms = JSON.stringify(JSON.parse(initialData.permissions), null, 2);
    } catch {
      initialPerms = initialData.permissions;
    }
  }

  const formatForDisplay = (name: string) => {
    if (!name) return '';
    return name.replace('ROLE_', '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const [formData, setFormData] = useState({
    name: formatForDisplay(initialData?.name || ''),
    description: initialData?.description || '',
    permissions: initialPerms,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate JSON
    let parsedPerms;
    try {
      parsedPerms = formData.permissions ? JSON.parse(formData.permissions) : [];
    } catch (err) {
      setError('Permissions must be a valid JSON string (e.g. ["READ", "WRITE"]).');
      setLoading(false);
      return;
    }

    const formattedName = formData.name.toUpperCase().startsWith('ROLE_') 
      ? formData.name.toUpperCase().replace(/\s+/g, '_')
      : `ROLE_${formData.name.toUpperCase().trim().replace(/\s+/g, '_')}`;

    const payload = {
      name: formattedName,
      description: formData.description,
      permissions: JSON.stringify(parsedPerms),
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
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Role Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
              placeholder="e.g. ROLE_EDITOR"
            />
            <p className="text-xs text-muted mt-2">Recommended format: uppercase, prefixed with ROLE_</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
              placeholder="What can this role do?"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-muted" />
              Permissions (JSON Array)
            </label>
            <textarea
              rows={5}
              value={formData.permissions}
              onChange={(e) => setFormData({...formData, permissions: e.target.value})}
              className="w-full px-4 py-3 bg-surface border border-hairline-strong rounded-lg text-ink font-mono text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
              placeholder={'[\n  "POST_CREATE",\n  "POST_EDIT"\n]'}
            ></textarea>
            <p className="text-xs text-muted mt-2">Provide a valid JSON array or object for fine-grained permissions if your app uses them.</p>
          </div>
        </div>
      </div>
    </form>
  );
}
