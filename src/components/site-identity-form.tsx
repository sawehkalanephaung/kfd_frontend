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
  X
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
      <label className="block text-sm font-semibold text-ink">{label}</label>
      {hint && <p className="text-xs text-muted">{hint}</p>}
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
      <div className="flex items-center justify-center py-20 bg-canvas rounded-lg shadow-sm border border-hairline-soft">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
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
        <h2 className="text-lg font-bold text-ink">Manage Identity</h2>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
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
        <div className="bg-brand-green-soft text-brand-green-dark p-4 rounded-full border border-brand-green/20 text-sm font-medium">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left column ── */}
        <div className="space-y-6">
          {/* Organisation card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h3 className="text-base font-bold text-ink flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-muted" />
              Organisation
            </h3>
            <div className="space-y-5">
              <Field
                label="Organisation Name"
                hint="The official name shown in the header and meta tags."
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => set('organizationName')(e.target.value)}
                    placeholder="e.g. Kaung Foundation"
                    className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
              </Field>

              <Field
                label="Tagline"
                hint="A short, memorable description shown below the logo or in the hero section."
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => set('tagline')(e.target.value)}
                    placeholder="e.g. Empowering Communities Since 2010"
                    className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
              </Field>

              <Field
                label="Footer Copyright Text"
                hint="Appears in the site footer. Use {year} to insert the current year automatically."
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Copyright className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="text"
                    value={formData.footerCopyright}
                    onChange={(e) => set('footerCopyright')(e.target.value)}
                    placeholder="e.g. © {year} Kaung Foundation. All rights reserved."
                    className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">
          {/* Logo card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h3 className="text-base font-bold text-ink flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-muted" />
              Logo
            </h3>
            <div className="space-y-4">
              <Field
                label="Logo URL"
                hint="Paste the full URL or relative path to your logo image (PNG, SVG, WebP recommended)."
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => set('logoUrl')(e.target.value)}
                    placeholder="https://... or /media/logo.png"
                    className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
              </Field>

              {/* Logo preview */}
              {resolvedLogo ? (
                <div className="group relative rounded-xl overflow-hidden border border-hairline-strong aspect-square bg-canvas flex items-center justify-center p-4">
                  <img
                    src={resolvedLogo}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <a
                      href={resolvedLogo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-canvas text-slate p-3 rounded-full hover:bg-surface hover:scale-110 transition-transform shadow-sm flex items-center justify-center"
                      title="Open Image"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => set('logoUrl')('')}
                      className="bg-canvas text-red-500 p-3 rounded-full hover:bg-red-50 hover:scale-110 transition-transform shadow-sm"
                      title="Remove Image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-hairline bg-surface flex items-center justify-center aspect-square p-4">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <ImageIcon className="w-8 h-8 text-gray-200" />
                    <p className="text-sm text-muted">Logo preview</p>
                    <p className="text-xs text-muted max-w-[150px]">Enter a URL above to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live preview card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h3 className="text-sm font-bold text-steel uppercase tracking-wide mb-4">
              Footer Preview
            </h3>
            <div className="bg-gray-900 rounded-xl p-5 text-white space-y-1">
              {formData.organizationName ? (
                <p className="font-bold text-white">{formData.organizationName}</p>
              ) : (
                <p className="font-bold text-steel italic">Organisation Name</p>
              )}
              {formData.tagline ? (
                <p className="text-sm text-muted">{formData.tagline}</p>
              ) : (
                <p className="text-sm text-steel italic">Your tagline here</p>
              )}
              <div className="border-t border-gray-700 mt-3 pt-3">
                {formData.footerCopyright ? (
                  <p className="text-xs text-muted">
                    {formData.footerCopyright.replace('{year}', String(new Date().getFullYear()))}
                  </p>
                ) : (
                  <p className="text-xs text-steel italic">Footer copyright text</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
