import { cache } from 'react';
import { getMediaUrl } from '@/lib/api';
import { SiteIdentity } from '@/lib/site-identity-events';

export { SITE_IDENTITY_UPDATED_EVENT, type SiteIdentity } from '@/lib/site-identity-events';

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
