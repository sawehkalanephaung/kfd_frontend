'use client';

import React from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import SiteIdentityForm from '@/components/site-identity-form';

/**
 * Organization identity — the brand name, tagline, logo and footer line used
 * across the public website.
 *
 * Sits under Organization Management alongside Global Contact Info, which is the
 * same kind of setting: one global record that the public site reads.
 * SiteIdentityForm loads and saves its own data, so this page is just the shell.
 */
export default function OrganizationIdentityPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Organization Management</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Organization Identity</span>
      </div>

      {/* Header Section */}
      <div className="bg-canvas rounded-lg p-8 shadow-sm border border-hairline-soft mb-6">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Building2 className="w-6 h-6 text-brand-green" />
          Organization Identity
        </h1>
        <p className="text-steel mt-1">
          Manage the organization&apos;s name, tagline, logo and footer copyright.
          These appear in the site header, footer and browser tab across the public website.
        </p>
      </div>

      <SiteIdentityForm />
    </div>
  );
}
