/**
 * Canonical public origin, used for the sitemap, robots.txt and absolute
 * social-card URLs. Set NEXT_PUBLIC_SITE_URL per environment; the fallback is
 * the production address already used in the site metadata.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kfd-kawthoolei.org').replace(/\/$/, '');
