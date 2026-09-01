/**
 * Fired on `window` after a successful admin save, so already-mounted client
 * components (e.g. the dashboard sidebar) can refetch without waiting for a
 * full page navigation. Server components don't need this — they refetch on
 * every request anyway.
 *
 * Split out from `site-identity.ts` so client components can subscribe to
 * this event without pulling in `getSiteIdentity`'s server-only fetch (which
 * embeds the backend's absolute URL and belongs only in the server bundle).
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
