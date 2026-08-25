'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, MessageCircleQuestion } from 'lucide-react';
import FaqForm from '@/components/faq-form';
import PageHeader from '@/components/page-header';
import api from '@/lib/api';

export default function EditFaqPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [faqData, setFaqData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const res = await api.get(`/api/v1/admin/faqs/${id}`);
        setFaqData(res.data?.data || res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load FAQ details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFaq();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-steel">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
        Loading FAQ details...
      </div>
    );
  }

  if (error || !faqData) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'FAQ not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={MessageCircleQuestion}
        title="Edit FAQ"
        description="Update the question, answer, and display settings for this FAQ."
      />

      <FaqForm isEdit={true} initialData={faqData} faqId={id} />
    </div>
  );
}
