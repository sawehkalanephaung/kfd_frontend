import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Calendar, Tag, ImageIcon } from "lucide-react";
import { NewsPost, PostCategory, PaginatedPosts } from "./types";

export const metadata: Metadata = {
  title: "News & Announcements - Kawthoolei Forestry Department",
  description:
    "Field dispatches, scientific reports, and updates from the conservation frontlines in Kawthoolei.",
};

export const dynamic = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ── Data fetchers ───────────────────────────────────────────────

async function getCategories(): Promise<PostCategory[]> {
  try {
    const res = await fetch(`${API}/api/v1/public/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * The post list is this page's primary content, so a real backend failure
 * throws (→ `(public)/error.tsx` retry UI) instead of rendering an empty
 * grid indistinguishable from "no posts published yet."
 */
async function getPosts(page: number, categorySlug?: string): Promise<PaginatedPosts | null> {
  const params = new URLSearchParams({ page: String(page), size: "9" });
  if (categorySlug) {
    params.set("categorySlug", categorySlug);
  }
  const res = await fetch(`${API}/api/v1/public/posts?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load posts: ${res.status}`);
  const json = await res.json();
  return json.data || null;
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

// Deterministic accent color per category name
const CATEGORY_COLORS: Record<string, string> = {
  "field update": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "policy brief": "bg-sky-500/20 text-sky-300 border-sky-500/30",
  "water systems": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  conservation: "bg-green-500/20 text-green-300 border-green-500/30",
  announcement: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  report: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  wildlife: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

function getCategoryColor(name?: string): string {
  if (!name) return "bg-green-500/20 text-green-300 border-green-500/30";
  return CATEGORY_COLORS[name.toLowerCase()] ?? "bg-brand-green/20 text-brand-green border-brand-green/30";
}

function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ── Page ───────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const { page: pageParam, category: categoryParam } = await searchParams;
  const currentPage = Math.max(0, parseInt(pageParam || "0", 10));
  const activeCategory = categoryParam || "";

  const [categories, paginatedData] = await Promise.all([
    getCategories(),
    getPosts(currentPage, activeCategory || undefined),
  ]);

  const posts = paginatedData?.content ?? [];

  const featured = posts[0] ?? null;
  const gridPosts = posts.slice(1);
  const totalPages = paginatedData?.totalPages ?? 1;

  return (
    <main className="min-h-screen bg-[#0b1a10]">
      {/* ── Header ──────────────────────────────────────────── */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            The Living Archive
          </h1>
          <p className="text-base text-green-300/60 max-w-xl leading-relaxed">
            Field dispatches, scientific reports, and updates from the conservation
            frontlines in Kawthoolei.
          </p>
        </div>
      </section>

      {/* ── Category Filter ─────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/news"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  !activeCategory
                    ? "bg-green-500 text-white border-green-400"
                    : "bg-canvas/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/news?category=${cat.slug}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeCategory === cat.slug
                      ? "bg-green-500 text-white border-green-400"
                      : "bg-canvas/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
        {/* ── Featured Post ──────────────────────────────────── */}
        {featured && currentPage === 0 && !activeCategory && (
          <Link
            href={`/news/${featured.slug}`}
            className="group relative block w-full h-[420px] rounded-2xl overflow-hidden mb-12 shadow-2xl bg-[#0f2318]"
          >
            {featured.featuredImageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${getMediaUrl(featured.featuredImageUrl)}')` }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon size={64} className="text-white/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8">
              {featured.category && (
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-widest border px-2.5 py-1 rounded-full mb-3 ${getCategoryColor(featured.category.name)}`}
                >
                  {featured.category.name}
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight max-w-2xl group-hover:text-brand-green transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm text-white/70 leading-relaxed max-w-xl line-clamp-2 mb-3">
                {featured.excerpt}
              </p>
              <p className="text-xs text-white/40 font-medium">
                {formatDate(featured.publishedAt)} &middot; 5 MIN READ
              </p>
            </div>
          </Link>
        )}

        {/* ── Post Grid ─────────────────────────────────────── */}
        {gridPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {(currentPage === 0 && !activeCategory ? gridPosts : posts).map((post, idx) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group flex flex-col rounded-xl overflow-hidden bg-[#0f2318] border border-white/5 hover:border-brand-green-dark/40 transition-all  hover:shadow-xl hover:shadow-card"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-[#1a3024] flex items-center justify-center">
                  {post.featuredImageUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url('${getMediaUrl(post.featuredImageUrl)}')` }}
                    />
                  ) : (
                    <ImageIcon size={32} className="text-white/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f2318]/60 to-transparent" />
                  {post.category && (
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded-full ${getCategoryColor(post.category.name)}`}
                      >
                        {post.category.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-sm font-bold text-white leading-snug mb-2 group-hover:text-brand-green transition-colors line-clamp-3">
                    {post.title}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-4 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                      <Calendar size={11} />
                      {formatDate(post.publishedAt)}
                    </div>
                    <div className="text-green-400 group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-canvas/5 flex items-center justify-center mx-auto mb-4">
              <Tag size={24} className="text-white/30" />
            </div>
            <p className="text-white/40 text-sm">No posts found for this category.</p>
            <Link href="/news" className="text-green-400 hover:text-brand-green text-sm mt-3 inline-block underline">
              View all news →
            </Link>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {/* Prev */}
          <Link
            href={currentPage > 0 ? `/news?page=${currentPage - 1}${activeCategory ? `&category=${activeCategory}` : ""}` : "#"}
              aria-disabled={currentPage === 0}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                currentPage === 0
                  ? "border-white/10 text-white/20 pointer-events-none"
                  : "border-white/20 text-white/60 hover:border-white/40 hover:text-white"
              }`}
            >
              <ChevronLeft size={16} />
            </Link>

            {/* Pages */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i;
              const isActive = p === currentPage;
              return (
                <Link
                  key={p}
                  href={`/news?page=${p}${activeCategory ? `&category=${activeCategory}` : ""}`}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border transition-all ${
                    isActive
                      ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-900/40"
                      : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {p + 1}
                </Link>
              );
            })}

            {/* Next */}
            <Link
              href={currentPage < totalPages - 1 ? `/news?page=${currentPage + 1}${activeCategory ? `&category=${activeCategory}` : ""}` : "#"}
              aria-disabled={currentPage >= totalPages - 1}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                currentPage >= totalPages - 1
                  ? "border-white/10 text-white/20 pointer-events-none"
                  : "border-white/20 text-white/60 hover:border-white/40 hover:text-white"
              }`}
            >
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
