'use client';

import { useEffect } from 'react';

/** Appended to every admin tab title, e.g. "Posts | Admin". */
export const ADMIN_TITLE_SUFFIX = 'Admin';

/** How long after mount we keep re-asserting the title (see below). */
const REASSERT_WINDOW_MS = 4000;

/**
 * Sets the browser tab / screen-reader page title for an admin screen.
 *
 * Most admin pages are client components, which cannot export Next.js
 * `metadata`, so without this every page shared one identical tab title.
 *
 * On a hard reload Next streams its own metadata <title> in *after*
 * hydration, which would replace ours with the generic layout fallback.
 * So for a short window after mount we put our title back whenever the
 * <title> changes. Client-side navigation needs no help, but the same
 * window covers it.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    if (!title) return;
    const full = `${title} | ${ADMIN_TITLE_SUFFIX}`;
    const apply = () => {
      if (document.title !== full) document.title = full;
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    const stop = window.setTimeout(() => observer.disconnect(), REASSERT_WINDOW_MS);

    return () => {
      window.clearTimeout(stop);
      observer.disconnect();
    };
  }, [title]);
}
