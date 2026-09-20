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

/**
 * fetch() for a page whose entire content is one resource: a real failure
 * throws (→ `(public)/error.tsx` retry UI) instead of degrading silently.
 * Isolates a network-level failure (fetch() itself rejecting) from an HTTP
 * error response so each gets its own accurate message — folding both into
 * one try/catch was the root cause of pages reporting "backend server
 * unreachable" when the backend was in fact reachable and returning a 500.
 *
 * Deliberately does not parse the body or special-case 404 — callers keep
 * their own response shape and "not found" handling exactly as before.
 */
export async function fetchPublicResource(url: string, label: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err) {
    throw new Error(
      `Failed to load ${label}: backend server unreachable (${err instanceof Error ? err.message : String(err)})`
    );
  }
}
