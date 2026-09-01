'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Users } from 'lucide-react';
import api from '@/lib/api';
import TeamMemberForm from '@/components/team-member-form';
import PageHeader from '@/components/page-header';

export default function EditTeamMemberPage() {
  const params = useParams();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await api.get(`/api/v1/admin/team-members/${params.id}`);
        setMember(res.data?.data || res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load Chairman.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMember();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-steel">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
        Loading member details...
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Chairman not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={Users}
        title="Edit Chairman"
        description={`Update profile information for ${member.firstName} ${member.lastName}.`}
      />
      <TeamMemberForm initialData={member} isEdit={true} memberId={params.id as string} />
    </div>
  );
}
