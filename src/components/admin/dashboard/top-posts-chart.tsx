import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export interface TopPost {
  id: string;
  title: string;
  views: number;
}

interface TopPostsChartProps {
  posts: TopPost[];
  loading?: boolean;
}

export function TopPostsChart({ posts, loading = false }: TopPostsChartProps) {
  const displayPosts = posts.slice(0, 5);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const totalViewsTop5 = displayPosts.reduce((sum, p) => sum + p.views, 0);
  const maxViews = displayPosts.length > 0 ? Math.max(...displayPosts.map((p) => p.views)) : 0;

  // Calculate Y-axis labels (e.g. 0, max/4, max/2, 3max/4, max). Below 5
  // distinct values, use fewer ticks instead of padding the axis past the
  // real max — that previously showed a fixed "4" ceiling even when the
  // tallest bar (scaled against the true max) reached 100% at 2 views.
  const tickCount = maxViews > 0 ? Math.min(5, maxViews + 1) : 1;
  const yAxisTicks: number[] = [];
  for (let i = tickCount - 1; i >= 0; i--) {
    yAxisTicks.push(tickCount === 1 ? 0 : Math.round((maxViews / (tickCount - 1)) * i));
  }

  const selectedPost = displayPosts[selectedIndex];
  const selectedShare = selectedPost && totalViewsTop5 > 0 
    ? Math.round((selectedPost.views / totalViewsTop5) * 100) 
    : 0;

  return (
    <div className="bg-canvas rounded-xl p-6 shadow-sm border border-hairline-soft flex flex-col h-full min-h-[540px]">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-ink">Top viewed posts</h2>
          <p className="text-sm text-steel mt-1">Total views per post</p>
        </div>
        <Link 
          href="/dashboard/posts" 
          className="text-sm font-semibold text-brand-green-dark hover:text-brand-green transition-colors"
        >
          All posts
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-end">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
            Loading views…
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">
            No views data available.
          </div>
        ) : (
          <div className="relative h-[250px] w-full flex">
            {/* Y-axis */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {yAxisTicks.map((tick, i) => {
                const isBottom = i === yAxisTicks.length - 1;
                return (
                  <div key={i} className="flex items-center w-full">
                    <span className="w-8 text-xs font-medium text-steel text-right pr-3 -translate-y-1/2">
                      {tick}
                    </span>
                    <div 
                      className={`flex-1 h-px ${isBottom ? 'bg-[#C9CEC8]' : 'bg-hairline-soft'}`} 
                    />
                  </div>
                );
              })}
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex justify-around items-end pl-8 pb-px z-10 h-full">
              {displayPosts.map((post, index) => {
                const isSelected = index === selectedIndex;
                const heightPercentage = maxViews > 0 ? (post.views / maxViews) * 100 : 0;
                const barHeight = `max(${heightPercentage}%, 4px)`;
                
                return (
                  <div key={post.id} className="flex flex-col items-center group relative h-full justify-end">
                    {/* View count above bar */}
                    <span 
                      className={`mb-2 text-[16px] transition-all duration-300 ${isSelected ? 'font-bold text-[#1F6A30]' : 'font-medium text-steel opacity-0 group-hover:opacity-100'}`}
                    >
                      {post.views}
                    </span>
                    
                    {/* The Bar */}
                    <button
                      type="button"
                      aria-label={`${post.title}, ${post.views} views`}
                      onClick={() => setSelectedIndex(index)}
                      className={`
                        w-[64px] rounded-t-[8px] transition-all duration-300 cursor-pointer
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-green
                        ${isSelected ? 'bg-[#1F6A30]' : 'bg-[#9FCFA7] hover:bg-[#7DBE87]'}
                      `}
                      style={{ height: barHeight }}
                    />

                    {/* Labels below chart */}
                    <div className="absolute top-full mt-3 w-24 flex flex-col items-center text-center">
                      <span className={`text-xs ${isSelected ? 'font-bold text-ink' : 'font-medium text-steel'}`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span 
                        className={`text-[11px] leading-tight mt-1 line-clamp-2 ${isSelected ? 'font-bold text-ink' : 'font-medium text-steel'}`}
                        title={post.title}
                      >
                        {post.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary Box */}
      <div className="mt-16 bg-surface-soft rounded-[12px] p-4 flex items-center justify-between">
        <div className="font-semibold text-sm text-ink truncate pr-4">
          {selectedPost?.title || 'No post selected'}
        </div>
        <div className="text-sm text-steel whitespace-nowrap shrink-0">
          <span className="font-bold text-ink">{selectedPost?.views || 0} views</span>
          <span className="mx-1.5">·</span>
          <span>{selectedShare}% of top 5</span>
        </div>
      </div>
    </div>
  );
}
