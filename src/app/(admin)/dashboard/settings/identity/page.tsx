'use client';

import React from 'react';
import Link from 'next/link';
import { Fingerprint } from 'lucide-react';
import SiteIdentityForm from '@/components/site-identity-form';

export default function IdentitySettingsPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-gray-500">System Settings</span>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">Site Identity</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Fingerprint className="w-6 h-6 text-emerald-500" />
          Site Identity
        </h1>
        <p className="text-gray-500 mt-1">
          Configure your organisation's name, tagline, logo, and footer copyright text.
          These values are displayed globally across the public-facing site.
        </p>
      </div>

      {/* Form */}
      <SiteIdentityForm />
    </div>
  );
}
