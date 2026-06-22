'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, Loader2, Globe } from 'lucide-react';
import api from '@/lib/api';
import ContactSettingsForm from '@/components/contact-settings-form';
import SocialMediaManager from '@/components/social-media-manager';

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
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-500">System Settings</span>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">Global Contact Info</span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Globe className="w-6 h-6 text-emerald-500" />
          Global Contact Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage the organization's physical address, emails, phone numbers, and social media links.
          These details are displayed globally across the public application.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-50">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
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
