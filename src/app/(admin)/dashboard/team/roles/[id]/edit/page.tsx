'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import RoleForm from '@/components/role-form';

export default function EditRolePage() {
  const params = useParams();
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await api.get(`/api/v1/admin/roles/${params.id}`);
        setRole(res.data?.data || res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load role.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRole();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
        Loading role details...
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Role not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
        <p className="text-gray-500 mt-1">
          Update the {role.name} role and its permissions.
        </p>
      </div>
      <RoleForm initialData={role} isEdit={true} roleId={params.id as string} />
    </div>
  );
}
