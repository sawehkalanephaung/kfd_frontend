import { cache } from 'react';
import { getMediaUrl } from '@/lib/api';

/**
 * Fired on `window` after a successful admin save, so already-mounted client
 * components (e.g. the dashboard sidebar) can refetch without waiting for a
 * full page navigation. Server components don't need this — they refetch on
 * every request anyway.
 */
export const SITE_IDENTITY_UPDATED_EVENT = 'kfd:site-identity-updated';

export interface SiteIdentity {
  id: string | null;
  organizationName: string;
  /** S'gaw Karen name, shown beneath the English one in the header and footer. */
  organizationNameKaren: string | null;
  tagline: string | null;
  /** Raw path as stored by the API (e.g. `/uploads/brand/logo.png`), not directly loadable. */
  logoUrl: string | null;
  /** `logoUrl` resolved to an absolute, browser-loadable URL. Use this for rendering. */
  resolvedLogoUrl: string | null;
  footerCopyright: string | null;
}

/**
 * Values used when the API is unreachable.
 *
 * Branding must never be the reason a page fails to render, so every consumer
 * degrades to these rather than throwing. They match what the site displayed
 * when the name was hardcoded, so a failed fetch looks identical to the old
 * behaviour instead of showing an empty header.
 */
const FALLBACK: SiteIdentity = {
  id: null,
  organizationName: 'Kawthoolei Forestry Department',
  organizationNameKaren: 'ကီၢ်သူလ့ၤသ့ၣ်ပှၢ်ဝဲၤကျိၤ',
  tagline: null,
  logoUrl: null,
  resolvedLogoUrl: null,
  footerCopyright: null,
};

/**
 * Reads the organization's branding for server components.
 *
 * Wrapped in React's `cache` so the Navbar, Footer and page metadata share a
 * single request per render rather than each issuing their own.
 *
 * `no-store` matches how the Navbar already loads its department list: content
 * an administrator edits should appear on the public site as soon as it is
 * saved, not after a cache window expires.
 */
export const getSiteIdentity = cache(async (): Promise<SiteIdentity> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  try {
    const res = await fetch(`${baseUrl}/api/v1/public/site-identity`, {
      cache: 'no-store',
    });

    if (!res.ok) return FALLBACK;

    const data = await res.json();
    // The public endpoint returns the DTO directly, but tolerate a wrapped shape.
    const identity = data?.data ?? data;

    if (!identity?.organizationName) return FALLBACK;

    const logoUrl = identity.logoUrl ?? null;

    return {
      id: identity.id ?? null,
      organizationName: identity.organizationName,
      organizationNameKaren: identity.organizationNameKaren ?? null,
      tagline: identity.tagline ?? null,
      logoUrl,
      resolvedLogoUrl: logoUrl ? getMediaUrl(logoUrl) : null,
      footerCopyright: identity.footerCopyright ?? null,
    };
  } catch {
    return FALLBACK;
  }
});
