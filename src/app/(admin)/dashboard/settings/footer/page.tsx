'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutList } from 'lucide-react';
import FooterLinkManager from '@/components/footer-link-manager';

export default function FooterSettingsPage() {
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
        <span className="text-gray-900 font-medium">Footer Links</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <LayoutList className="w-6 h-6 text-emerald-500" />
          Footer Links Management
        </h1>
        <p className="text-gray-500 mt-1">
          Organize your site's footer by creating sections and adding links to each.
          Sections and links can be individually toggled active/inactive and reordered.
        </p>
      </div>

      {/* Manager */}
      <FooterLinkManager />
    </div>
  );
}
