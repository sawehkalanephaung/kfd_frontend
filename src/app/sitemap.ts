import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Item {
  id?: string;
  slug?: string;
  updatedAt?: string;
  publishedAt?: string;
}

/** A failed or empty feed must never break the sitemap - it just lists less. */
async function fetchItems(path: string): Promise<Item[]> {
  try {
    const res = await fetch(`${API}/api/v1/public/${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data ?? json;
    const list = Array.isArray(data) ? data : data?.content;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

const STATIC_PATHS = [
  '/',
  '/about',
  '/about/chairman',
  '/history',
  '/team',
  '/departments',
  '/news',
  '/news/announcements',
  '/news/events',
  '/resources',
  '/contact',
  '/privacy-policy',
  '/terms-of-use',
  '/accessibility',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, departments, publications, team] = await Promise.all([
    fetchItems('posts?size=200'),
    fetchItems('departments'),
    fetchItems('publications?size=200'),
    fetchItems('team-members'),
  ]);

  const entry = (path: string, date?: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    ...(date ? { lastModified: new Date(date) } : {}),
  });

  return [
    ...STATIC_PATHS.map((p) => entry(p)),
    ...posts.filter((p) => p.slug).map((p) => entry(`/news/${p.slug}`, p.updatedAt || p.publishedAt)),
    ...departments.filter((d) => d.slug).map((d) => entry(`/departments/${d.slug}`, d.updatedAt)),
    ...publications.filter((p) => p.slug).map((p) => entry(`/resources/${p.slug}`, p.updatedAt || p.publishedAt)),
    ...team.filter((m) => m.id).map((m) => entry(`/team/${m.id}`, m.updatedAt)),
  ];
}
