'use client';

import React from 'react';
import Link from 'next/link';
import { Landmark } from 'lucide-react';
import SiteIdentityForm from '@/components/site-identity-form';
import PageHeader from '@/components/page-header';

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

      <PageHeader
        icon={Landmark}
        title="Organization Identity"
        description="Manage the organization's name, tagline, logo and footer copyright. These appear in the site header, footer and browser tab across the public website."
      />

      <SiteIdentityForm />
    </div>
  );
}
