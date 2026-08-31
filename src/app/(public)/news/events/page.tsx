import { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { NewsPost, PaginatedPosts } from "../types";
import { PageHero } from "@/components/ui/page-hero";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/** Sole content of this page — a real failure throws so error.tsx offers a retry. */
async function getEvents(): Promise<PaginatedPosts | null> {
  const params = new URLSearchParams({ page: "0", size: "20", categorySlug: "event" });
  const res = await fetch(`${API}/api/v1/public/posts?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load events: ${res.status}`);
  const json = await res.json();
  return json.data || null;
}

function EventCard({ post }: { post: NewsPost }) {
  const eventDateStr = post.metadata?.eventDate || post.publishedAt || post.createdAt;
  const eventDate = new Date(eventDateStr);
  const month = eventDate.toLocaleString('en-US', { month: 'short' });
  const day = eventDate.getDate();
  const eventTime = post.metadata?.eventTime || "Time TBD";
  const eventLocation = post.metadata?.eventLocation || "KFD Jurisdiction";

  return (
    <Link 
      href={`/news/${post.slug}`}
      className="group flex flex-col md:flex-row bg-white dark:bg-forest-800 border border-hairline dark:border-white/5 rounded-2xl overflow-hidden hover:border-brand-green-dark/40 transition-all hover:shadow-xl hover:shadow-card block"
    >
      
      {/* Calendar Block (Left) */}
      <div className="bg-surface-soft dark:bg-canvas/5 border-r border-hairline dark:border-white/5 flex flex-col items-center justify-center p-6 md:w-32 shrink-0">
        <span className="text-green-500 dark:text-green-400 font-bold uppercase tracking-widest text-xs mb-1">{month}</span>
        <span className="text-4xl md:text-5xl font-extrabold text-ink dark:text-white leading-none">{day}</span>
      </div>

      {/* Content Block (Middle) */}
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <h3 className="text-xl md:text-2xl font-bold text-ink dark:text-white mb-2 leading-tight group-hover:text-brand-green-dark dark:group-hover:text-brand-green transition-colors">
          {post.title}
        </h3>
        <p className="text-steel dark:text-white/60 text-sm md:text-base leading-relaxed line-clamp-2 mb-4">
          {post.excerpt}
        </p>
        
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-steel/80 dark:text-white/40">
            <Calendar size={14} />
            <span>{eventTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-steel/80 dark:text-white/40">
            <MapPin size={14} />
            <span>{eventLocation}</span>
          </div>
        </div>
      </div>

    </Link>
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
    <main className="min-h-screen bg-[#f9f7f1] dark:bg-canvas">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8 max-w-5xl">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-green-400 hover:text-brand-green transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to News
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold font-sans text-ink dark:text-white tracking-tight">
          Upcoming Events
        </h1>
        <p className="mt-4 text-lg text-steel dark:text-white/60 max-w-2xl">
          Join us in our community programs, reforestation drives, and public workshops.
        </p>
      </div>
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* Content */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <EventCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-forest-800 border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-white/40">There are currently no upcoming events scheduled.</p>
          </div>
        )}
      </div>
    </main>
  );
}
