'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import UserForm from '@/components/user-form';

export default function EditUserPage() {
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/v1/admin/users/${params.id}`);
        setUser(res.data?.data || res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load user.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
        Loading user details...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'User not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit System User</h1>
        <p className="text-gray-500 mt-1">
          Update account information and access levels for {user.firstName} {user.lastName}.
        </p>
      </div>
      <UserForm initialData={user} isEdit={true} userId={params.id as string} />
    </div>
  );
}
