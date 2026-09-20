'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';
import { useOutsideClick } from '@/lib/use-outside-click';

interface PostResult {
  id: string;
  title: string;
}

interface MediaResult {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

const MIN_QUERY_LENGTH = 2;
const RESULTS_PER_TYPE = 5;
const DEBOUNCE_MS = 400;

/**
 * Global admin search: posts and media only. Pages has no `search` query
 * param on its admin endpoint yet (unlike posts/media), so it's left out of
 * results rather than silently returning everything or nothing for a page
 * query — the placeholder below says what it actually searches.
 */
export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [media, setMedia] = useState<MediaResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, () => setIsOpen(false), isOpen);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setPosts([]);
      setMedia([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const q = encodeURIComponent(debouncedQuery);

    Promise.allSettled([
      api.get(`/api/v1/admin/cms/posts?search=${q}&size=${RESULTS_PER_TYPE}`),
      api.get(`/api/v1/admin/media?search=${q}&size=${RESULTS_PER_TYPE}`),
    ]).then(([postsResult, mediaResult]) => {
      if (cancelled) return;
      setPosts(postsResult.status === 'fulfilled' ? (postsResult.value.data?.content ?? []) : []);
      setMedia(mediaResult.status === 'fulfilled' ? (mediaResult.value.data?.content ?? []) : []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const hasQuery = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const hasResults = posts.length > 0 || media.length > 0;
  const close = () => setIsOpen(false);
  const resultsId = useId();

  return (
    <div className="hidden md:flex items-center relative w-[320px] max-w-full" ref={containerRef}>
      <Search className="w-4 h-4 text-muted absolute left-4 z-10 pointer-events-none" aria-hidden="true" />
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen && hasQuery}
        aria-controls={resultsId}
        aria-haspopup="listbox"
        aria-label="Search posts and media"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            close();
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder="Search posts, media..."
        className="w-full bg-surface-soft border border-hairline-strong rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
      />

      {isOpen && hasQuery && (
        <div
          id={resultsId}
          role="listbox"
          className="absolute z-50 top-full mt-2 w-full bg-canvas border border-hairline-strong rounded-xl shadow-modal max-h-96 overflow-y-auto"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Searching…
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-sm text-steel">
              No results for &ldquo;{debouncedQuery}&rdquo;
            </div>
          ) : (
            <div className="py-2">
              {posts.length > 0 && (
                <div className="px-2">
                  <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted">Posts</p>
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/dashboard/posts/${post.id}/edit`}
                      onClick={close}
                      className="dropdown-row-hover flex items-center gap-3 px-2 py-2 rounded-lg transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-surface border border-hairline flex items-center justify-center shrink-0 text-muted">
                        <FileText className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm text-ink truncate">{post.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              {media.length > 0 && (
                <div className="px-2 mt-1">
                  <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted">Media</p>
                  {media.map((asset) => (
                    <Link
                      key={asset.id}
                      href={`/dashboard/media/${asset.id}/edit`}
                      onClick={close}
                      className="dropdown-row-hover flex items-center gap-3 px-2 py-2 rounded-lg transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-surface border border-hairline overflow-hidden flex items-center justify-center shrink-0 text-muted">
                        {asset.fileType?.startsWith('image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getMediaUrl(asset.fileUrl)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4" aria-hidden="true" />
                        )}
                      </span>
                      <span className="text-sm text-ink truncate">{asset.fileName}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
