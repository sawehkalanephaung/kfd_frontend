import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, User, Calendar, Share2, Bookmark } from "lucide-react";
import { NewsPostDetail, NewsPost } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Data fetcher ───────────────────────────────────────────────

async function getPost(slug: string): Promise<NewsPostDetail | null> {
  try {
    const res = await fetch(`${API}/api/v1/public/posts/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

// ── Metadata ───────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "News - KFD" };
  return {
    title: `${post.title} - KFD`,
    description: post.excerpt || "",
  };
}

// ── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

const CATEGORY_COLORS: Record<string, string> = {
  "field update": "bg-amber-500/20 text-amber-300 border-amber-500/40",
  "policy brief": "bg-sky-500/20 text-sky-300 border-sky-500/40",
  "water systems": "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  conservation: "bg-green-500/20 text-green-300 border-green-500/40",
  announcement: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  report: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  wildlife: "bg-orange-500/20 text-orange-300 border-orange-500/40",
};

function getCategoryColor(name?: string): string {
  if (!name) return "bg-green-500/20 text-green-300 border-green-500/40";
  return CATEGORY_COLORS[name.toLowerCase()] ?? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1200&auto=format&fit=crop",
];

function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ── Related Post Card ──────────────────────────────────────────

function RelatedCard({ post, idx }: { post: NewsPost; idx: number }) {
  const img = post.featuredImageUrl ? getMediaUrl(post.featuredImageUrl) : FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden bg-[#0f2318] border border-white/5 hover:border-green-700/40 transition-all hover:-translate-y-1"
    >
      <div className="relative h-40 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${img}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {post.category && (
          <div className="absolute top-3 left-3">
            <span className={`text-[9px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded-full ${getCategoryColor(post.category.name)}`}>
              {post.category.name}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-sm font-bold text-white leading-snug mb-2 group-hover:text-green-300 transition-colors line-clamp-2">
          {post.title}
        </h4>
        <p className="text-xs text-white/40 line-clamp-2 mb-3 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div className="flex items-center gap-1 text-[11px] text-white/30">
            <Calendar size={10} />
            {formatDate(post.publishedAt)}
          </div>
          <ArrowRight size={14} className="text-green-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const heroImage = post.featuredImageUrl ? getMediaUrl(post.featuredImageUrl) : FALLBACK_IMAGES[0];

  return (
    <main className="min-h-screen bg-[#0b1a10]">
      {/* ── Hero Header ─────────────────────────────────────── */}
      <section className="pt-16 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl text-center">
          {/* Category pill */}
          {post.category && (
            <div className="mb-5">
              <span className={`inline-block text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full ${getCategoryColor(post.category.name)}`}>
                {post.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/40">
            {post.authorId && (
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-white/30" />
                <span>KFD Author</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-white/30" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-3 ml-2">
              <button className="text-white/30 hover:text-white/60 transition-colors" title="Share">
                <Share2 size={16} />
              </button>
              <button className="text-white/30 hover:text-white/60 transition-colors" title="Bookmark">
                <Bookmark size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Image ───────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 mb-12">
        <div className="container mx-auto max-w-4xl">
          <div
            className="w-full h-72 md:h-[420px] rounded-2xl bg-cover bg-center shadow-2xl"
            style={{ backgroundImage: `url('${heroImage}')` }}
          />
        </div>
      </section>

      {/* ── Article Body ─────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="container mx-auto max-w-3xl">
          {post.content ? (
            <div
              className="prose prose-invert prose-sm md:prose-base max-w-none
                prose-p:text-white/70 prose-p:leading-relaxed
                prose-headings:text-white prose-headings:font-bold
                prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-blockquote:border-green-500
                prose-blockquote:text-white/60 prose-li:text-white/70"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            /* Fallback: show excerpt repeated if no HTML content */
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <p key={i} className="text-white/70 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/10">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs font-medium bg-white/5 border border-white/10 text-white/50 px-3 py-1 rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Related Topics ───────────────────────────────────── */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-white mb-8">Related Topic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {post.relatedPosts.map((related, idx) => (
                <RelatedCard key={related.id} post={related} idx={idx} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── View All News CTA ────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="container mx-auto max-w-5xl flex justify-center">
          <Link
            href="/news"
            className="flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/50 font-semibold px-8 py-3 rounded-full text-sm transition-all"
          >
            View All News
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
