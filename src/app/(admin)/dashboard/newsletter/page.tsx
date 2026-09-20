'use client';

import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import NewsletterSubscribers from '@/components/newsletter-subscribers';
import PageHeader from '@/components/page-header';

export default function NewsletterSettingsPage() {
  return (
    <div>
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
