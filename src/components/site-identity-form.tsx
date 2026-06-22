'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Save,
  Building2,
  Type,
  Image as ImageIcon,
  Copyright,
  ExternalLink,
} from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteIdentityData {
  id?: string;
  organizationName: string;
  tagline: string;
  logoUrl: string;
  footerCopyright: string;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SiteIdentityForm() {
  const [formData, setFormData] = useState<SiteIdentityData>({
    organizationName: '',
    tagline: '',
    logoUrl: '',
    footerCopyright: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/v1/admin/site-identity');
        const d = res.data;
        setFormData({
          id: d.id,
          organizationName: d.organizationName || '',
          tagline: d.tagline || '',
          logoUrl: d.logoUrl || '',
          footerCopyright: d.footerCopyright || '',
        });
      } catch (err: any) {
        // 404 is fine — first-time setup, form will create via PUT
        if (err.response?.status !== 404) {
          console.error(err);
          setError('Failed to load site identity settings.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const set = (key: keyof SiteIdentityData) => (value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      const payload = {
        organizationName: formData.organizationName.trim(),
        tagline: formData.tagline.trim(),
        logoUrl: formData.logoUrl.trim(),
        footerCopyright: formData.footerCopyright.trim(),
      };
      await api.put('/api/v1/admin/site-identity', payload);
      setSuccessMsg('Site identity saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save site identity.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p>Loading site identity...</p>
        </div>
      </div>
    );
  }

  const resolvedLogo = formData.logoUrl ? getMediaUrl(formData.logoUrl) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Manage Identity</h2>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-sm font-medium">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left column ── */}
        <div className="space-y-6">
          {/* Organisation card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-gray-400" />
              Organisation
            </h3>
            <div className="space-y-5">
              <Field
                label="Organisation Name"
                hint="The official name shown in the header and meta tags."
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => set('organizationName')(e.target.value)}
                    placeholder="e.g. Kaung Foundation"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </Field>

              <Field
                label="Tagline"
                hint="A short, memorable description shown below the logo or in the hero section."
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => set('tagline')(e.target.value)}
                    placeholder="e.g. Empowering Communities Since 2010"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </Field>

              <Field
                label="Footer Copyright Text"
                hint="Appears in the site footer. Use {year} to insert the current year automatically."
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Copyright className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.footerCopyright}
                    onChange={(e) => set('footerCopyright')(e.target.value)}
                    placeholder="e.g. © {year} Kaung Foundation. All rights reserved."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">
          {/* Logo card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              Logo
            </h3>
            <div className="space-y-4">
              <Field
                label="Logo URL"
                hint="Paste the full URL or relative path to your logo image (PNG, SVG, WebP recommended)."
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => set('logoUrl')(e.target.value)}
                    placeholder="https://... or /media/logo.png"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </Field>

              {/* Logo preview */}
              <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center min-h-[160px] p-4">
                {resolvedLogo ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <img
                      src={resolvedLogo}
                      alt="Logo preview"
                      className="max-h-32 max-w-full object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <a
                      href={resolvedLogo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open in new tab
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <ImageIcon className="w-8 h-8 text-gray-200" />
                    <p className="text-sm text-gray-400">Logo preview will appear here</p>
                    <p className="text-xs text-gray-300">Enter a URL above to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live preview card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
              Footer Preview
            </h3>
            <div className="bg-gray-900 rounded-xl p-5 text-white space-y-1">
              {formData.organizationName ? (
                <p className="font-bold text-white">{formData.organizationName}</p>
              ) : (
                <p className="font-bold text-gray-600 italic">Organisation Name</p>
              )}
              {formData.tagline ? (
                <p className="text-sm text-gray-300">{formData.tagline}</p>
              ) : (
                <p className="text-sm text-gray-600 italic">Your tagline here</p>
              )}
              <div className="border-t border-gray-700 mt-3 pt-3">
                {formData.footerCopyright ? (
                  <p className="text-xs text-gray-400">
                    {formData.footerCopyright.replace('{year}', String(new Date().getFullYear()))}
                  </p>
                ) : (
                  <p className="text-xs text-gray-600 italic">Footer copyright text</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
