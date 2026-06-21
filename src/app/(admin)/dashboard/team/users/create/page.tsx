'use client';

import React from 'react';
import UserForm from '@/components/user-form';

export default function CreateUserPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create System User</h1>
        <p className="text-gray-500 mt-1">
          Add a new administrative user with access to the KFD dashboard.
        </p>
      </div>
      <UserForm />
    </div>
  );
}
