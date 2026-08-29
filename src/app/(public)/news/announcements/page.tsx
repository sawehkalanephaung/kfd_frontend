import { Metadata } from "next";
import Link from "next/link";
import { Bell, ChevronRight, FileText } from "lucide-react";
import { NewsPost, PaginatedPosts } from "../types";
import { PageHero } from "@/components/ui/page-hero";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/** Sole content of this page — a real failure throws so error.tsx offers a retry. */
async function getAnnouncements(): Promise<PaginatedPosts | null> {
  const params = new URLSearchParams({ page: "0", size: "20", categorySlug: "announcement" });
  const res = await fetch(`${API}/api/v1/public/posts?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load announcements: ${res.status}`);
  const json = await res.json();
  return json.data || null;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function AnnouncementCard({ post }: { post: NewsPost }) {
  return (
    <Link 
      href={`/news/${post.slug}`}
      className="group block bg-canvas rounded-xl overflow-hidden border-2 border-transparent hover:border-brand-green/30 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Side: Formal Date/Icon Badge */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-r border-hairline flex flex-col justify-center items-center p-6 md:w-48 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
          <div className="w-12 h-12 bg-canvas rounded-full flex items-center justify-center shadow-sm border border-brand-green/20 mb-3 text-brand-green-dark group-hover:scale-110 transition-transform">
            <Bell size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green-dark/70 mb-1">Posted</span>
          <span className="text-sm font-semibold text-ink text-center">{formatDate(post.publishedAt)}</span>
        </div>

        {/* Right Side: Content */}
        <div className="p-6 md:p-8 flex flex-col flex-1 bg-canvas">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface text-steel text-[10px] font-bold uppercase tracking-widest rounded-md">
              <FileText size={12} />
              Official Notice
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-ink mb-3 group-hover:text-brand-green-dark transition-colors leading-tight">
            {post.title}
          </h2>
          <p className="text-steel leading-relaxed text-sm md:text-base line-clamp-2 mb-4 flex-1">
            {post.excerpt}
          </p>
          <div className="mt-auto flex items-center text-brand-green-dark font-semibold text-sm group-hover:underline">
            Read Full Notice <ChevronRight size={16} className="ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export const metadata: Metadata = {
  title: "Official Announcements - Kawthoolei Forestry Department",
  description: "Official announcements, notices, and policy changes from the Kawthoolei Forestry Department.",
};

export default async function AnnouncementsPage() {
  const data = await getAnnouncements();
  const posts = data?.content || [];

  return (
    <main className="min-h-screen bg-forest-950">
      <PageHero
        title="Official Announcements"
        subtitle="Important notices, policy updates, and official communications from the department."
        align="left"
        backLink={{ href: "/news", label: "Back to News" }}
      />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* Content */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <AnnouncementCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-forest-800 border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-white/40">New announcements will be published here.</p>
          </div>
        )}
      </div>
    </main>
  );
}
