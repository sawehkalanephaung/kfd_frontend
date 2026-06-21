'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import FaqForm from '@/components/faq-form';
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
        const res = await api.get(`/api/faqs/${id}`);
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
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
        Loading FAQ details...
      </div>
    );
  }

  if (error || !faqData) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'FAQ not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit FAQ</h1>
        <p className="text-gray-500 mt-1">
          Update the question, answer, and display settings for this FAQ.
        </p>
      </div>
      
      <FaqForm isEdit={true} initialData={faqData} faqId={id} />
    </div>
  );
}
