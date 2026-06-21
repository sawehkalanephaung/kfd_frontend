'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import TagForm from '@/components/tag-form';
import api from '@/lib/api';

export default function EditTagPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [tagData, setTagData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const res = await api.get(`/api/v1/admin/cms/tags/${id}`);
        setTagData(res.data?.data || res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load tag details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTag();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
        Loading tag details...
      </div>
    );
  }

  if (error || !tagData) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Tag not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Tag</h1>
        <p className="text-gray-500 mt-1">
          Update the name or slug for this tag.
        </p>
      </div>
      
      <TagForm isEdit={true} initialData={tagData} tagId={id} />
    </div>
  );
}
