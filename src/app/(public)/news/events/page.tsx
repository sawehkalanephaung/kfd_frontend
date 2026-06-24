import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, ArrowRight } from "lucide-react";
import { NewsPost, PaginatedPosts } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getEvents(): Promise<PaginatedPosts | null> {
  try {
    const params = new URLSearchParams({ page: "0", size: "20", categorySlug: "event" });
    const res = await fetch(`${API}/api/v1/public/posts?${params}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

function EventCard({ post }: { post: NewsPost }) {
  const eventDate = new Date(post.publishedAt || post.createdAt);
  const month = eventDate.toLocaleString('en-US', { month: 'short' });
  const day = eventDate.getDate();

  return (
    <div className="group flex flex-col md:flex-row bg-[#0f2318] border border-white/5 rounded-2xl overflow-hidden hover:border-green-700/40 transition-all hover:shadow-xl hover:shadow-green-900/20">
      
      {/* Calendar Block (Left) */}
      <div className="bg-white/5 border-r border-white/5 flex flex-col items-center justify-center p-6 md:w-32 shrink-0">
        <span className="text-green-400 font-bold uppercase tracking-widest text-xs mb-1">{month}</span>
        <span className="text-4xl md:text-5xl font-extrabold text-white leading-none">{day}</span>
      </div>

      {/* Content Block (Middle) */}
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-green-300 transition-colors">
          {post.title}
        </h3>
        <p className="text-white/60 text-sm md:text-base leading-relaxed line-clamp-2 mb-4">
          {post.excerpt}
        </p>
        
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Calendar size={14} />
            <span>Time TBD</span> {/* We could parse this from content or add a field later */}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <MapPin size={14} />
            <span>KFD Jurisdiction</span>
          </div>
        </div>
      </div>

      {/* Action Block (Right) */}
      <div className="p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-white/5 shrink-0">
        <Link 
          href={`/news/${post.slug}`}
          className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-green-500 hover:bg-green-400 text-green-950 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 group-hover:shadow-lg group-hover:shadow-green-500/25"
        >
          Details
          <ArrowRight size={16} className="ml-2" />
        </Link>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Upcoming Events - Kawthoolei Forestry Department",
  description: "Calendar and details for upcoming events hosted by the Kawthoolei Forestry Department.",
};

export default async function EventsPage() {
  const data = await getEvents();
  const posts = data?.content || [];

  return (
    <main className="min-h-screen bg-[#0b1a10] pt-20 pb-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link href="/news" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to News
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Upcoming Events
          </h1>
          <p className="text-base text-green-300/60 max-w-xl leading-relaxed">
            Join us in our community programs, reforestation drives, and public workshops.
          </p>
        </div>

        {/* Content */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <EventCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-[#0f2318] border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-white/40">There are currently no upcoming events scheduled.</p>
          </div>
        )}
      </div>
    </main>
  );
}
