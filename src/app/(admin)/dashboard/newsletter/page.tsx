'use client';

import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import NewsletterSubscribers from '@/components/newsletter-subscribers';

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

      {/* Header */}
      <div className="bg-canvas rounded-lg p-8 shadow-sm border border-hairline-soft mb-6">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Mail className="w-6 h-6 text-brand-green" />
          Newsletter Subscribers
        </h1>
        <p className="text-steel mt-1">
          View and manage all newsletter subscribers. People subscribe via the public-facing
          newsletter form. You can remove individual subscribers from this list.
        </p>
      </div>

      {/* Subscriber list */}
      <NewsletterSubscribers />
    </div>
  );
}
