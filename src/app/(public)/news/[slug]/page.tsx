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
      className="group flex flex-col rounded-xl overflow-hidden bg-[#fdfaf5] shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
    >
      <div className="relative h-56 overflow-hidden bg-gray-100 flex items-center justify-center">
        {post.featuredImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${getMediaUrl(post.featuredImageUrl)}')` }}
          />
        ) : (
          <ImageIcon className="w-10 h-10 text-gray-300" />
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        {post.category && (
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              {post.category.name}
            </span>
          </div>
        )}
        <h4 className="text-xl font-bold font-serif text-gray-900 leading-snug mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {post.title}
        </h4>
        <p className="text-sm text-gray-600 font-sans line-clamp-3 mb-6 flex-1 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200/60">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-sans">
            <Calendar size={12} />
            {formatDate(post.publishedAt)}
          </div>
          <ArrowRight size={14} className="text-emerald-700 group-hover:translate-x-1 transition-transform" />
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
  const metadata: any = post.metadata || {};

  // ── Event Layout ───────────────────────────────────────────────
  if (categorySlug === 'event') {
    const eventDate = metadata.eventDate ? new Date(metadata.eventDate) : new Date(post.publishedAt || post.createdAt);
    const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = eventDate.getDate();

    return (
      <main className="min-h-screen bg-[#0b1a10]">
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0f2318] to-[#0b1a10]">
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
                  <div
                    className="w-full h-64 rounded-2xl bg-cover bg-center shadow-2xl mb-8 border border-white/10"
                    style={{ backgroundImage: `url('${getMediaUrl(post.featuredImageUrl)}')` }}
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
          <div className="p-8 md:p-12 print:p-0 relative overflow-hidden text-gray-900">
            {/* Memo Header */}
            <div className="border-b-2 border-gray-900 pb-8 mb-8 text-center relative flex flex-col items-center">
              <div className="flex items-center gap-3 justify-center mb-2">
                <h1 className="text-3xl md:text-4xl tracking-[0.2em] uppercase font-serif font-black">
                  Official Memorandum
                </h1>
              </div>
              <p className="text-gray-500 font-serif italic text-lg">Kawthoolei Forestry Department</p>
            </div>

            {/* Memo Meta Table */}
            <div className="mb-10 font-sans text-sm border-b border-gray-300 pb-8">
              <div className="grid grid-cols-12 gap-y-5">
                <div className="col-span-3 font-bold text-gray-800 uppercase tracking-widest text-xs flex items-center">TO:</div>
                <div className="col-span-9 text-gray-900 font-serif text-base">Public Record</div>

                <div className="col-span-3 font-bold text-gray-800 uppercase tracking-widest text-xs flex items-center">FROM:</div>
                <div className="col-span-9 text-gray-900 font-serif text-base">KFD Administration</div>

                <div className="col-span-3 font-bold text-gray-800 uppercase tracking-widest text-xs flex items-center">DATE:</div>
                <div className="col-span-9 text-gray-900 font-serif text-base">{formatDate(post.publishedAt || post.createdAt)}</div>

                <div className="col-span-3 font-bold text-gray-800 uppercase tracking-widest text-xs flex items-center">SUBJECT:</div>
                <div className="col-span-9 text-gray-900 font-bold font-serif text-base">{post.title}</div>
              </div>
            </div>

            {/* Memo Content */}
            <div className="font-serif text-gray-800 leading-loose text-lg pb-12 border-b border-gray-300">
              {post.content ? (
                <div
                  className="prose prose-lg max-w-none break-words font-serif prose-p:text-gray-800 prose-p:leading-loose prose-headings:text-gray-900 prose-a:text-emerald-700"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <p>{post.excerpt}</p>
              )}
            </div>
            
            {/* Footer actions */}
            <div className="pt-8 flex flex-wrap items-center justify-between gap-4 font-sans text-sm">
               <div className="flex items-center gap-2 text-gray-500">
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
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest border border-emerald-800/30 text-emerald-800 px-4 py-1.5 rounded-sm bg-transparent">
                {post.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-gray-900 leading-tight mb-8">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-center text-sm text-gray-500 font-sans font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Image ───────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="container mx-auto max-w-5xl">
          {hasHeroImage ? (
            <div
              className="w-full h-72 md:h-[500px] rounded-xl bg-cover bg-center shadow-lg"
              style={{ backgroundImage: `url('${getMediaUrl(post.featuredImageUrl)}')` }}
            />
          ) : (
            <div className="w-full h-72 md:h-[500px] rounded-xl bg-gray-200 flex items-center justify-center shadow-inner">
              <ImageIcon className="w-16 h-16 text-gray-400" />
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
                prose-p:text-gray-800 prose-p:leading-loose
                prose-headings:text-gray-900 prose-headings:font-serif
                prose-a:text-emerald-700 prose-a:underline hover:prose-a:text-emerald-900
                prose-strong:text-gray-900 prose-strong:font-bold
                prose-blockquote:bg-[#dce9d5] prose-blockquote:border-none prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:rounded-lg prose-blockquote:text-emerald-900 prose-blockquote:italic prose-blockquote:font-serif prose-blockquote:font-medium
                prose-li:text-gray-800
                first-letter:text-7xl first-letter:font-bold first-letter:text-emerald-800 first-letter:mr-3 first-letter:float-left first-letter:leading-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-gray-800 font-serif text-lg leading-loose first-letter:text-7xl first-letter:font-bold first-letter:text-emerald-800 first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Author Bio & Tags */}
          <div className="mt-20 border-t border-gray-300 pt-10 font-sans">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-0.5">Written by</p>
                <h4 className="text-gray-900 font-bold font-serif text-lg">KFD Editorial Team</h4>
                <p className="text-sm text-gray-500 mt-0.5">Kawthoolei Forestry Department</p>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[13px] text-gray-600 font-serif bg-[#e4e0d4] border border-[#d2ccbf] px-4 py-1.5 rounded-md"
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
              <h2 className="text-2xl font-bold font-serif text-gray-900">Related Stories</h2>
              <Link
                href="/news"
                className="flex items-center gap-2 border border-emerald-800/30 text-emerald-800 hover:bg-emerald-800/5 hover:text-emerald-900 font-bold px-6 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all"
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
              className="flex items-center gap-2 border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-500 font-semibold px-8 py-3 rounded-full text-sm transition-all"
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
