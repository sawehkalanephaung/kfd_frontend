"use client";

import { DepartmentData } from "../../departments/types";
import { Calendar, Tag } from "lucide-react";
import Link from "next/link";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr));
}

export default function DepartmentActivity({ data }: { data: DepartmentData }) {
  // Show posts that are NOT in the "Announcement" category and are PUBLISHED
  const posts = (data.posts || []).filter(p => {
    const isPublished = !(p as any).status || (p as any).status === 'PUBLISHED';
    const isAnnouncement = (p as any).categoryName?.toLowerCase() === 'announcement';
    return isPublished && !isAnnouncement;
  });

  return (
    <div className="py-8 max-w-4xl">
      <div className="divide-y divide-hairline">
        {posts.map((post) => (
          <div key={post.id} className="py-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center group">
            <div className="flex-1">
              <Link href={`/news/${post.slug}`} className="text-[15px] font-medium text-blue-500 hover:text-blue-700 transition-colors block mb-1">
                {post.title}
              </Link>
              <div className="flex items-center gap-2 text-[13px] text-steel">
                <span className="flex items-center gap-1.5">
                  <Tag size={14} className="text-muted rotate-90" />
                  {post.excerpt || 'Activity'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[13px] text-steel font-medium shrink-0 mt-2 sm:mt-0">
              <Calendar size={14} className="text-muted" />
              {formatDate(post.publishedAt)}
            </div>
          </div>
        ))}
        
        {posts.length === 0 && (
          <div className="py-12 text-steel text-sm">
            No activities found.
          </div>
        )}
      </div>
    </div>
  );
}
