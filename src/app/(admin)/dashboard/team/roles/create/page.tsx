'use client';

import React from 'react';
import RoleForm from '@/components/role-form';

export default function CreateRolePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Role</h1>
        <p className="text-gray-500 mt-1">
          Define a new system role and its permissions.
        </p>
      </div>
      <RoleForm />
    </div>
  );
}
