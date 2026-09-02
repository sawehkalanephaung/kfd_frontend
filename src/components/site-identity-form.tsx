'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Save,
  Building2,
  Type,
  Languages,
  Image as ImageIcon,
  Copyright,
  ExternalLink,
  X
} from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';
import { SITE_IDENTITY_UPDATED_EVENT } from '@/lib/site-identity-events';
import MediaSelector from '@/components/media-selector';
import ImageUploadField from '@/components/image-upload-field';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteIdentityData {
  id?: string;
  organizationName: string;
  organizationNameKaren: string;
  tagline: string;
  logoUrl: string;
  footerCopyright: string;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SiteIdentityForm() {
  const [formData, setFormData] = useState<SiteIdentityData>({
    organizationName: '',
    organizationNameKaren: '',
    tagline: '',
    logoUrl: '',
    footerCopyright: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  /** A library asset is already uploaded and hosted, so it is applied straight away. */
  const handleLibrarySelect = (assets: { fileUrl: string }[]) => {
    if (assets.length === 0) return;
    setFormData((prev) => ({ ...prev, logoUrl: assets[0].fileUrl }));
  };

  // Fetch on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/v1/admin/site-identity');
        const d = res.data;
        setFormData({
          id: d.id,
          organizationName: d.organizationName || '',
          organizationNameKaren: d.organizationNameKaren || '',
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
        organizationNameKaren: formData.organizationNameKaren.trim(),
        tagline: formData.tagline.trim(),
        logoUrl: formData.logoUrl.trim(),
        footerCopyright: formData.footerCopyright.trim(),
      };
      await api.put('/api/v1/admin/site-identity', payload);
      window.dispatchEvent(new Event(SITE_IDENTITY_UPDATED_EVENT));
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
        <Button
          type="submit"
          disabled={saving}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
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
              <FormField
                label="Organisation Name"
                hint="The official name shown in the header and meta tags."
              >
                {(fieldProps) => (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-muted" aria-hidden="true" />
                    </div>
                    <input
                      {...fieldProps}
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => set('organizationName')(e.target.value)}
                      placeholder="e.g. Kaung Foundation"
                      className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </FormField>

              <FormField
                label="Organisation Name (Karen)"
                hint="Shown beneath the English name in the site header and footer. Leave blank to hide it."
              >
                {(fieldProps) => (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Languages className="h-5 w-5 text-muted" aria-hidden="true" />
                    </div>
                    <input
                      {...fieldProps}
                      type="text"
                      lang="ksw"
                      value={formData.organizationNameKaren}
                      onChange={(e) => set('organizationNameKaren')(e.target.value)}
                      placeholder="ကီၢ်သူလ့ၤသ့ၣ်ပှၢ်ဝဲၤကျိၤ"
                      className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </FormField>

              <FormField
                label="Tagline"
                hint="A short, memorable description shown below the logo or in the hero section."
              >
                {(fieldProps) => (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Type className="h-5 w-5 text-muted" aria-hidden="true" />
                    </div>
                    <input
                      {...fieldProps}
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => set('tagline')(e.target.value)}
                      placeholder="e.g. Empowering Communities Since 2010"
                      className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </FormField>

              <FormField
                label="Footer Copyright Text"
                hint="Appears in the site footer. Use {year} to insert the current year automatically."
              >
                {(fieldProps) => (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Copyright className="h-5 w-5 text-muted" aria-hidden="true" />
                    </div>
                    <input
                      {...fieldProps}
                      type="text"
                      value={formData.footerCopyright}
                      onChange={(e) => set('footerCopyright')(e.target.value)}
                      placeholder="e.g. © {year} Kaung Foundation. All rights reserved."
                      className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </FormField>
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
              <FormField
                label="Brand Logo"
                hint="Pick a PNG, SVG, or WebP image from your media library — new files can be uploaded there."
              >
                {() => (
                  <ImageUploadField
                    previewUrl={formData.logoUrl ? getMediaUrl(formData.logoUrl) : null}
                    onLibraryClick={() => setIsMediaSelectorOpen(true)}
                    onRemoveClick={() => setFormData({ ...formData, logoUrl: '' })}
                    alt="Logo preview"
                    fit="contain"
                    emptyLabel="No logo uploaded"
                  />
                )}
              </FormField>
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

      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={handleLibrarySelect}
        uploadCategory="brand"
        multiple={false}
        title="Select Organization Logo"
      />
    </form>
  );
}
