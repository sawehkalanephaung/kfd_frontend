import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bell, ChevronRight, FileText } from "lucide-react";
import { NewsPost, PaginatedPosts } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getAnnouncements(): Promise<PaginatedPosts | null> {
  try {
    const params = new URLSearchParams({ page: "0", size: "20", categorySlug: "announcement" });
    const res = await fetch(`${API}/api/v1/public/posts?${params}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
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
      className="group block bg-white rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-200 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Side: Formal Date/Icon Badge */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-r border-gray-100 flex flex-col justify-center items-center p-6 md:w-48 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100 mb-3 text-emerald-600 group-hover:scale-110 transition-transform">
            <Bell size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600/70 mb-1">Posted</span>
          <span className="text-sm font-semibold text-gray-900 text-center">{formatDate(post.publishedAt)}</span>
        </div>

        {/* Right Side: Content */}
        <div className="p-6 md:p-8 flex flex-col flex-1 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-md">
              <FileText size={12} />
              Official Notice
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors leading-tight">
            {post.title}
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm md:text-base line-clamp-2 mb-4 flex-1">
            {post.excerpt}
          </p>
          <div className="mt-auto flex items-center text-emerald-600 font-semibold text-sm group-hover:underline">
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
    <main className="min-h-screen bg-[#0b1a10] pt-20 pb-20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link href="/news" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to News
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Official Announcements
          </h1>
          <p className="text-base text-green-300/60 max-w-xl leading-relaxed">
            Important notices, policy updates, and official communications from the department.
          </p>
        </div>

        {/* Content */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <AnnouncementCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-[#0f2318] border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-white/40">New announcements will be published here.</p>
          </div>
        )}
      </div>
    </main>
  );
}
