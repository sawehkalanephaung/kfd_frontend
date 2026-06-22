'use client';

import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import NewsletterSubscribers from '@/components/newsletter-subscribers';

export default function NewsletterSettingsPage() {
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
        <span className="text-gray-900 font-medium">Newsletter</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Mail className="w-6 h-6 text-emerald-500" />
          Newsletter Subscribers
        </h1>
        <p className="text-gray-500 mt-1">
          View and manage all newsletter subscribers. People subscribe via the public-facing
          newsletter form. You can remove individual subscribers from this list.
        </p>
      </div>

      {/* Subscriber list */}
      <NewsletterSubscribers />
    </div>
  );
}
