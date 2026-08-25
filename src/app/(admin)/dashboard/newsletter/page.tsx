'use client';

import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import NewsletterSubscribers from '@/components/newsletter-subscribers';
import PageHeader from '@/components/page-header';

export default function NewsletterSettingsPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-steel">Content Management</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Newsletter</span>
      </div>

      <PageHeader
        icon={Mail}
        title="Newsletter Subscribers"
        description="View and manage everyone who has subscribed to your newsletter through the public site."
      />

      {/* Subscriber list */}
      <NewsletterSubscribers />
    </div>
  );
}
