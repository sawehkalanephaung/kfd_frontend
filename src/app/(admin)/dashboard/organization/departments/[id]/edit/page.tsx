'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Building2 } from 'lucide-react';
import DepartmentForm from '@/components/department-form';
import PageHeader from '@/components/page-header';
import api from '@/lib/api';

export default function EditDepartmentPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [department, setDepartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await api.get(`/api/v1/admin/departments/${id}`);
        setDepartment(res.data?.data || res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load department details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDepartment();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-steel">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
        Loading department details...
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Department not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={Building2}
        title="Edit Department"
        description={`Update information for ${department.name}.`}
      />

      <DepartmentForm isEdit={true} initialData={department} departmentId={id} />
    </div>
  );
}
