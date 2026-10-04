import React from 'react';
import Link from 'next/link';
import { BarChart3, Eye, Loader2 } from 'lucide-react';

export interface TopPost {
  id: string;
  title: string;
  views: number;
}

interface TopPostsChartProps {
  posts: TopPost[];
  loading?: boolean;
}

const viewsLabel = (count: number) => `${count.toLocaleString()} ${count === 1 ? 'view' : 'views'}`;

/**
 * Ranked list of the five most-viewed posts. Horizontal bars rather than
 * columns: post titles are long, and a column chart forced them into tiny
 * truncated labels under fixed-width bars that overflowed narrow cards.
 * Every row states its own count, so the bar is a visual aid, not the only
 * carrier of the value.
 */
export function TopPostsChart({ posts, loading = false }: TopPostsChartProps) {
  const ranked = [...posts].sort((a, b) => b.views - a.views).slice(0, 5);
  const totalViews = ranked.reduce((sum, post) => sum + post.views, 0);
  const maxViews = ranked.length > 0 ? ranked[0].views : 0;

  return (
    <div className="bg-canvas rounded-xl p-6 shadow-sm border border-hairline-soft flex flex-col h-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-ink">Top viewed posts</h2>
          <p className="text-sm text-steel mt-1">Your five most-read posts, by total views</p>
        </div>
        <Link
          href="/dashboard/posts"
          className="shrink-0 text-sm font-semibold text-brand-green-dark hover:underline rounded py-1.5 -my-1.5 pointer-coarse:py-3 pointer-coarse:-my-3 outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
        >
          All posts
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-16 text-muted text-sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
          Loading views…
        </div>
      ) : ranked.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="w-8 h-8 text-muted mb-3" aria-hidden="true" />
          <p className="text-sm font-semibold text-ink">No posts yet</p>
          <p className="text-sm text-steel mt-1">Publish a post and its views will show up here.</p>
          <Link
            href="/dashboard/posts/create"
            className="mt-4 text-sm font-semibold text-brand-green-dark hover:underline rounded py-1.5 -my-1.5 pointer-coarse:py-3 pointer-coarse:-my-3 outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
          >
            Create a post
          </Link>
        </div>
      ) : (
        <>
          <ol className="flex-1 flex flex-col divide-y divide-hairline-soft">
            {ranked.map((post, index) => {
              const share = totalViews > 0 ? Math.round((post.views / totalViews) * 100) : 0;
              const barWidth = maxViews > 0 ? (post.views / maxViews) * 100 : 0;

              return (
                <li key={post.id} className="flex-1 flex items-center">
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="group flex w-full items-start gap-4 rounded-lg px-2 py-3 -mx-2 transition-colors hover:bg-surface-soft outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                        index === 0 ? 'bg-brand-green text-white' : 'bg-surface-soft text-steel'
                      }`}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-4">
                        <span className="text-sm font-semibold text-ink line-clamp-2 group-hover:text-brand-green-dark">
                          {post.title}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-ink tabular-nums">
                          {post.views.toLocaleString()}
                          <span className="sr-only"> {post.views === 1 ? 'view' : 'views'}</span>
                        </span>
                      </span>

                      {/* Track + bar. Decorative: the count beside the title carries the value. */}
                      <span className="mt-2 flex items-center gap-3" aria-hidden="true">
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-hairline">
                          <span
                            className="block h-full rounded-full bg-brand-green transition-[width] duration-500 motion-reduce:transition-none"
                            style={{ width: `${barWidth}%` }}
                          />
                        </span>
                        {totalViews > 0 && (
                          <span className="w-9 shrink-0 text-right text-xs text-muted tabular-nums">{share}%</span>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-3 text-sm text-steel">
            <Eye className="w-4 h-4 shrink-0 text-muted" aria-hidden="true" />
            {totalViews > 0 ? (
              <span>
                <span className="font-bold text-ink">{viewsLabel(totalViews)}</span> across these posts
              </span>
            ) : (
              <span>No views recorded yet. Counts appear once visitors open these posts.</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
