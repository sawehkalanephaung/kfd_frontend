import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, User, Calendar, Share2, Bookmark, ImageIcon, Download } from "lucide-react";
import { NewsPostDetail, NewsPost } from "../types";
import { AnnouncementActions } from "./AnnouncementActions";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Data fetcher ───────────────────────────────────────────────

/**
 * Returns null when the post genuinely does not exist (404), and throws on any
 * other failure so error.tsx can offer a retry. Returning null for both would
 * tell readers the article was removed when the API was simply unreachable.
 */
async function getPost(slug: string): Promise<NewsPostDetail | null> {
  const res = await fetch(`${API}/api/v1/public/posts/${slug}`, { cache: "no-store" });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load post "${slug}": ${res.status}`);

  const json = await res.json();
  return json.data || null;
}

// ── Metadata ───────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Metadata must never be the reason a readable page fails to render, so a
  // fetch problem here degrades to the generic title. The page body below does
  // the real error handling.
  try {
    const post = await getPost(slug);
    if (!post) return { title: "News - KFD" };
    return {
      title: `${post.title} - KFD`,
      description: post.excerpt || "",
    };
  } catch {
    return { title: "News - KFD" };
  }
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
  return CATEGORY_COLORS[name.toLowerCase()] ?? "bg-brand-green/20 text-brand-green border-brand-green/30";
}

function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ── Related Post Card ──────────────────────────────────────────

function RelatedCard({ post }: { post: NewsPost }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden bg-[#fdfaf5] shadow-sm hover:shadow-md transition-all "
    >
      <div className="relative h-56 overflow-hidden bg-surface flex items-center justify-center">
        {post.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getMediaUrl(post.featuredImageUrl)}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImageIcon className="w-10 h-10 text-gray-300" />
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        {post.category && (
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green-dark">
              {post.category.name}
            </span>
          </div>
        )}
        <h4 className="text-xl font-bold font-serif text-ink leading-snug mb-3 group-hover:text-brand-green-dark transition-colors line-clamp-2">
          {post.title}
        </h4>
        <p className="text-sm text-steel font-sans line-clamp-3 mb-6 flex-1 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-hairline-strong/60">
          <div className="flex items-center gap-1.5 text-xs text-steel font-sans">
            <Calendar size={12} />
            {formatDate(post.publishedAt)}
          </div>
          <ArrowRight size={14} className="text-brand-green-dark group-hover:translate-x-1 transition-transform" />
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

  const hasHeroImage = !!post.featuredImageUrl;
  const categorySlug = post.category?.slug?.toLowerCase();
  const metadata: any = (post as any).metadata || {};

  // ── Event Layout ───────────────────────────────────────────────
  if (categorySlug === 'event') {
    const eventDate = metadata.eventDate ? new Date(metadata.eventDate) : new Date(post.publishedAt || post.createdAt);
    const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = eventDate.getDate();

    return (
      <main className="min-h-screen bg-forest-950">
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-forest-800 to-forest-950">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              {/* Massive Calendar Badge & Meta */}
              <div className="w-full md:w-1/3 flex flex-col gap-6">
                <div className="bg-[#153020] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
                  <div className="bg-red-500/20 text-red-400 py-3 text-center font-bold tracking-widest uppercase text-sm border-b border-red-500/20">
                    {month}
                  </div>
                  <div className="py-8 text-center text-6xl font-black text-white">
                    {day}
                  </div>
                </div>

                <div className="bg-[#153020]/50 rounded-2xl border border-white/5 p-6 space-y-5">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-white/40 mb-1 font-bold">Time</h3>
                    <p className="text-white text-lg font-medium">{metadata.eventTime || 'TBA'}</p>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-white/40 mb-1 font-bold">Location</h3>
                    <p className="text-white text-lg font-medium">{metadata.eventLocation || 'TBA'}</p>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-white/40 mb-1 font-bold">Category</h3>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full mt-1 ${getCategoryColor(post.category?.name)}`}>
                      {post.category?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Content */}
              <div className="w-full md:w-2/3">
                {hasHeroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getMediaUrl(post.featuredImageUrl)}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-2xl shadow-2xl mb-8 border border-white/10"
                  />
                ) : (
                  <div className="w-full h-64 rounded-2xl bg-[#153020]/50 flex items-center justify-center shadow-2xl mb-8 border border-white/10">
                    <ImageIcon className="w-12 h-12 text-white/20" />
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-8">
                  {post.title}
                </h1>

                {post.content ? (
                  <div
                    className="prose prose-invert max-w-none break-words prose-p:text-white/70 prose-headings:text-white prose-a:text-green-400"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                ) : (
                  <p className="text-white/70 leading-relaxed">{post.excerpt}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Announcement Layout ─────────────────────────────────────────
  if (categorySlug === 'announcement') {
    return (
      <main className="min-h-screen print:min-h-0 bg-[#f4f1ea] print:bg-transparent py-16 print:py-0 px-4 sm:px-6 lg:px-8 print:px-0">
        <div className="container mx-auto max-w-3xl">
          <div className="p-8 md:p-12 print:p-0 relative overflow-hidden text-ink">
            {/* Memo Header */}
            <div className="border-b-2 border-gray-900 pb-8 mb-8 text-center relative flex flex-col items-center">
              <div className="flex items-center gap-3 justify-center mb-2">
                <h1 className="text-3xl md:text-4xl tracking-[0.2em] uppercase font-serif font-black">
                  Official Memorandum
                </h1>
              </div>
              <p className="text-steel font-serif italic text-lg">Kawthoolei Forestry Department</p>
            </div>

            {/* Memo Meta Table */}
            <div className="mb-10 font-sans text-sm border-b border-gray-300 pb-8">
              <div className="grid grid-cols-12 gap-y-5">
                <div className="col-span-3 font-bold text-charcoal uppercase tracking-widest text-xs flex items-center">TO:</div>
                <div className="col-span-9 text-ink font-serif text-base">Public Record</div>

                <div className="col-span-3 font-bold text-charcoal uppercase tracking-widest text-xs flex items-center">FROM:</div>
                <div className="col-span-9 text-ink font-serif text-base">KFD Administration</div>

                <div className="col-span-3 font-bold text-charcoal uppercase tracking-widest text-xs flex items-center">DATE:</div>
                <div className="col-span-9 text-ink font-serif text-base">{formatDate(post.publishedAt || post.createdAt)}</div>

                <div className="col-span-3 font-bold text-charcoal uppercase tracking-widest text-xs flex items-center">SUBJECT:</div>
                <div className="col-span-9 text-ink font-bold font-serif text-base">{post.title}</div>
              </div>
            </div>

            {/* Memo Content */}
            <div className="font-serif text-charcoal leading-loose text-lg pb-12 border-b border-gray-300">
              {post.content ? (
                <div
                  className="prose prose-lg max-w-none break-words font-serif prose-p:text-charcoal prose-p:leading-loose prose-headings:text-ink prose-a:text-brand-green-dark"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <p>{post.excerpt}</p>
              )}
            </div>
            
            {/* Footer actions */}
            <div className="pt-8 flex flex-wrap items-center justify-between gap-4 font-sans text-sm">
               <div className="flex items-center gap-2 text-steel">
                 <Calendar size={16} />
                 <span>{formatDate(post.publishedAt || post.createdAt)}</span>
               </div>
               <AnnouncementActions title={post.title} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── General Layout ──────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#f9f7f1]">
      {/* ── Hero Header ─────────────────────────────────────── */}
      <section className="pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center flex flex-col items-center">
          {/* Category pill */}
          {post.category && (
            <div className="mb-8">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest border border-teal-deep/30 text-brand-green-dark px-4 py-1.5 rounded-sm bg-transparent">
                {post.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-ink leading-tight mb-8">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-center text-sm text-steel font-sans font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-muted" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Image ───────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="container mx-auto max-w-5xl">
          {hasHeroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getMediaUrl(post.featuredImageUrl)}
              alt={post.title}
              className="w-full h-72 md:h-[500px] object-cover rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-full h-72 md:h-[500px] rounded-xl bg-gray-200 flex items-center justify-center shadow-inner">
              <ImageIcon className="w-16 h-16 text-muted" />
            </div>
          )}
        </div>
      </section>

      {/* ── Article Body ─────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="container mx-auto max-w-3xl">
          {post.content ? (
            <div
              className="prose prose-lg max-w-none break-words font-serif
                prose-p:text-charcoal prose-p:leading-loose
                prose-headings:text-ink prose-headings:font-serif
                prose-a:text-brand-green-dark prose-a:underline hover:prose-a:text-emerald-900
                prose-strong:text-ink prose-strong:font-bold
                prose-blockquote:bg-[#dce9d5] prose-blockquote:border-none prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:rounded-lg prose-blockquote:text-emerald-900 prose-blockquote:italic prose-blockquote:font-serif prose-blockquote:font-medium
                prose-li:text-charcoal
                first-letter:text-7xl first-letter:font-bold first-letter:text-brand-green-dark first-letter:mr-3 first-letter:float-left first-letter:leading-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-charcoal font-serif text-lg leading-loose first-letter:text-7xl first-letter:font-bold first-letter:text-brand-green-dark first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Author Bio & Tags */}
          <div className="mt-20 border-t border-gray-300 pt-10 font-sans">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                <User className="w-6 h-6 text-steel" />
              </div>
              <div>
                <p className="text-xs text-steel uppercase tracking-widest font-bold mb-0.5">Written by</p>
                <h4 className="text-ink font-bold font-serif text-lg">KFD Editorial Team</h4>
                <p className="text-sm text-steel mt-0.5">Kawthoolei Forestry Department</p>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[13px] text-steel font-serif bg-[#e4e0d4] border border-[#d2ccbf] px-4 py-1.5 rounded-md"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Related Topics ───────────────────────────────────── */}
      {post.relatedPosts && post.relatedPosts.length > 0 ? (
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-[#ece9df]">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-bold font-serif text-ink">Related Stories</h2>
              <Link
                href="/news"
                className="flex items-center gap-2 border border-teal-deep/30 text-brand-green-dark hover:bg-emerald-800/5 hover:text-brand-green-dark font-bold px-6 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all"
              >
                View All News
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {post.relatedPosts.map((related, idx) => (
                <RelatedCard key={related.id} post={related} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="container mx-auto max-w-5xl flex justify-center">
            <Link
              href="/news"
              className="flex items-center gap-2 border border-gray-300 text-steel hover:text-ink hover:border-gray-500 font-semibold px-8 py-3 rounded-full text-sm transition-all"
            >
              View All News
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
