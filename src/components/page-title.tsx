'use client';

import { useDocumentTitle } from '@/lib/use-document-title';

/**
 * Renders nothing; sets the browser tab title for the current admin screen.
 * Kept separate so `PageHeader` can stay a server component (server pages
 * pass it icon components, which cannot cross into a client component).
 */
export default function PageTitle({ title }: { title: string }) {
  useDocumentTitle(title);
  return null;
}
