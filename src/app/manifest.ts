import type { MetadataRoute } from 'next';
import { getSiteIdentity } from '@/lib/site-identity';

/** Web app manifest: gives the site a proper name and icon when saved to a phone's home screen. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { organizationName } = await getSiteIdentity();
  return {
    name: organizationName,
    short_name: organizationName.length > 12 ? 'KFD' : organizationName,
    description: 'Official portal of the Kawthoolei Forestry Department.',
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#0D7F3C',
    icons: [{ src: '/icon.png', type: 'image/png' }],
  };
}
