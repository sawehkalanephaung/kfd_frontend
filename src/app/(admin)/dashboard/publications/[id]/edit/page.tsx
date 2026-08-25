'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, FileText } from 'lucide-react';
import PublicationForm from '@/components/publication-form';
import PageHeader from '@/components/page-header';
import api from '@/lib/api';

export default function EditPublicationPage() {
  const params = useParams();
  const id = params.id as string;

  const [publicationData, setPublicationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const res = await api.get(`/api/v1/admin/cms/publications/${id}`);
        setPublicationData(res.data?.data || res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load publication details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPublication();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-steel">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
        Loading publication details...
      </div>
    );
  }

  if (error || !publicationData) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Publication not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={FileText}
        title="Edit Publication"
        description="Update the content, category, document, and publishing status for this publication."
      />

      <PublicationForm isEdit={true} initialData={publicationData} publicationId={id} />
    </div>
  );
}
