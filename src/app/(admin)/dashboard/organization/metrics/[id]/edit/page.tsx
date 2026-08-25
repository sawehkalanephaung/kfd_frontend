'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, BarChart2 } from 'lucide-react';
import MetricForm from '@/components/metric-form';
import PageHeader from '@/components/page-header';
import api from '@/lib/api';

export default function EditMetricPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [metric, setMetric] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetric = async () => {
      try {
        const res = await api.get(`/api/v1/admin/metrics/${id}`);
        setMetric(res.data?.data || res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load metric details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMetric();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-steel">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
        Loading metric details...
      </div>
    );
  }

  if (error || !metric) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Metric not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={BarChart2}
        title="Edit Global Metric"
        description="Update the value or display settings for this metric."
      />

      <MetricForm isEdit={true} initialData={metric} metricId={id} />
    </div>
  );
}
