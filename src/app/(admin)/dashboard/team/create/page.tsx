'use client';

import React from 'react';
import TeamMemberForm from '@/components/team-member-form';

export default function CreateTeamMemberPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Add Team Member</h1>
        <p className="text-steel mt-1">
          Create a new profile for a KFD organization member.
        </p>
      </div>
      <TeamMemberForm />
    </div>
  );
}
