'use client';

import React from 'react';
import { Users } from 'lucide-react';
import TeamMemberForm from '@/components/team-member-form';
import PageHeader from '@/components/page-header';

export default function CreateTeamMemberPage() {
  return (
    <div>
      <PageHeader
        icon={Users}
        title="Add Team Member"
        description="Create a new profile for a KFD organization member."
      />
      <TeamMemberForm />
    </div>
  );
}
