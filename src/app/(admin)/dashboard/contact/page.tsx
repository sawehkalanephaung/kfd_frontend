'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, Loader2, Contact as ContactIcon } from 'lucide-react';
import api from '@/lib/api';
import ContactSettingsForm from '@/components/contact-settings-form';
import SocialMediaManager from '@/components/social-media-manager';
import PageHeader from '@/components/page-header';

export default function ContactSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/contact-settings');
      // The endpoint returns a list of settings. We generally only need one global setting.
      const data = response.data?.content || response.data?.data || response.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setSettings(data[0]); // Take the first one as default
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load contact settings. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Organization Management</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Contact Information</span>
      </div>

      <PageHeader
        icon={ContactIcon}
        title="Contact Information"
        description="Manage the organization's physical address, emails, phone numbers, and social media links."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-canvas rounded-lg shadow-sm border border-hairline-soft">
          <div className="flex flex-col items-center gap-3 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
            <p>Loading contact settings...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      ) : (
        <>
          <ContactSettingsForm initialData={settings} />
          <SocialMediaManager />
        </>
      )}
    </div>
  );
}
