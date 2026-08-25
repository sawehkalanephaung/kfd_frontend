'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, FileText } from 'lucide-react';
import PageHeader from '@/components/page-header';
import PageForm from '@/components/page-form';
import api from '@/lib/api';

export default function EditPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const res = await api.get(`/api/v1/admin/pages/${id}`);
        setPageData(res.data?.data || res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load page details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPageData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-steel">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
        Loading page details...
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Page not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={FileText}
        title="Edit Page"
        description="Update the content and settings for this page."
      />

      <PageForm isEdit={true} initialData={pageData} pageId={id} />
    </div>
  );
}
