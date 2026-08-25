/**
 * Fetch helper for home-page sections.
 *
 * Unlike single-purpose pages (which can safely throw on failure and let
 * `(public)/error.tsx` take over the whole route), the home page aggregates
 * several independent sections — one section's outage must not blank the
 * rest of the page. This collapses "fetch failed" and "fetched, nothing
 * there" into a single discriminated result so callers can render an
 * honest inline error state for the former while staying silent for the
 * latter (matching existing behavior for legitimately-empty sections).
 */
export type FetchOutcome<T> =
  | { status: 'ok'; data: T }
  | { status: 'empty' }
  | { status: 'error' };

export async function fetchPublicList<T>(
  url: string,
  extract: (json: any) => T[],
  init?: RequestInit
): Promise<FetchOutcome<T[]>> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return { status: 'error' };
    const list = extract(await res.json());
    return list.length === 0 ? { status: 'empty' } : { status: 'ok', data: list };
  } catch {
    return { status: 'error' };
  }
}
