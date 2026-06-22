import { Metadata } from "next";
import Link from "next/link";
import { Search, FileText, Download, ChevronRight, ChevronLeft, Map as MapIcon, ChevronDown } from "lucide-react";
import { PaginatedMedia, MediaCategoryCount } from "./types";
import { redirect } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const metadata: Metadata = {
  title: "Resource Library - KFD",
  description: "Official Resource Library for policies, ecological reports, and spatial datasets.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ── Data Fetchers ──────────────────────────────────────────────

async function getMedia(page: number, search?: string, category?: string): Promise<PaginatedMedia | null> {
  try {
    const params = new URLSearchParams({ page: String(page), size: "10" });
    if (search) params.set("search", search);
    if (category) params.set("category", category);

    const res = await fetch(`${API}/api/v1/public/media?${params}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

async function getCategories(): Promise<MediaCategoryCount[]> {
  try {
    const res = await fetch(`${API}/api/v1/public/media/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

// ── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).toUpperCase();
}

function formatFileType(mimeType: string) {
  if (!mimeType) return "FILE";
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("zip")) return "ZIP";
  if (mimeType.includes("image")) return "IMAGE";
  if (mimeType.includes("word")) return "DOCX";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "XLSX";
  return "FILE";
}

function formatSize(kb: number) {
  if (!kb) return "0 KB";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

// ── Components ─────────────────────────────────────────────────

// Client Component for the Search Form to handle submission via URL
function SearchForm({ initialQuery }: { initialQuery: string }) {
  // We use a simple action to submit the form which natively updates the URL
  return (
    <form action="/resources" method="GET" className="w-full max-w-2xl mx-auto relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
      <input
        type="text"
        name="search"
        defaultValue={initialQuery}
        placeholder="Search policies, reports, or keywords..."
        className="w-full bg-[#0a1f14] border border-[#132d1f] rounded-lg py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
      />
    </form>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default async function ResourcesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const pageStr = resolvedSearchParams.page as string | undefined;
  const currentPage = pageStr ? parseInt(pageStr, 10) : 0;
  const activeCategory = (resolvedSearchParams.category as string) || "";
  const searchQuery = (resolvedSearchParams.search as string) || "";

  const [paginatedData, categoriesData] = await Promise.all([
    getMedia(currentPage, searchQuery, activeCategory),
    getCategories(),
  ]);

  const items = paginatedData?.content || [];
  const totalElements = paginatedData?.totalElements || 0;
  const totalPages = paginatedData?.totalPages || 0;
  const totalDocuments = categoriesData.reduce((acc, cat) => acc + cat.count, 0);

  // Sort categories by count (descending)
  const sortedCategories = [...categoriesData].sort((a, b) => b.count - a.count);

  // Helper to build URL
  const buildUrl = (page: number, cat: string, search: string) => {
    const params = new URLSearchParams();
    if (page > 0) params.set("page", String(page));
    if (cat) params.set("category", cat);
    if (search) params.set("search", search);
    return `/resources${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const showingStart = totalElements === 0 ? 0 : currentPage * 10 + 1;
  const showingEnd = Math.min((currentPage + 1) * 10, totalElements);

  return (
    <main className="min-h-screen bg-[#05110a] pt-24 pb-20">
      
      {/* ── Hero & Search ─────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
          Official Resource Library
        </h1>
        <p className="text-white/60 mb-10 max-w-lg mx-auto">
          Search across thousands of policies, ecological reports, and spatial datasets.
        </p>
        <SearchForm initialQuery={searchQuery} />
      </section>

      {/* ── Tabs & Filters ────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-8">
        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-3 border-b border-[#132d1f] pb-6 mb-6">
          <Link
            href={buildUrl(0, "", searchQuery)}
            className={`flex items-center gap-2 px-1 pb-2 border-b-2 transition-colors ${
              !activeCategory
                ? "border-green-500 text-green-400 font-medium"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            <span className="text-sm">All Documents</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${!activeCategory ? "bg-green-500 text-[#05110a] font-bold" : "bg-[#132d1f] text-white/60"}`}>
              {totalDocuments}
            </span>
          </Link>

          {sortedCategories.map((cat) => {
            if (!cat.category) return null;
            const isActive = activeCategory === cat.category;
            return (
              <Link
                key={cat.category}
                href={buildUrl(0, cat.category, searchQuery)}
                className={`flex items-center gap-2 px-1 pb-2 border-b-2 transition-colors ${
                  isActive
                    ? "border-green-500 text-green-400 font-medium"
                    : "border-transparent text-white/50 hover:text-white/80"
                }`}
              >
                <span className="text-sm">{cat.category}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? "bg-green-500 text-[#05110a] font-bold" : "bg-[#132d1f] text-white/60"}`}>
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Results Count & Sort */}
        <div className="flex items-center justify-between text-xs text-white/40 mb-6 px-2">
          <div>
            Showing {showingStart}-{showingEnd} of {totalElements} results
          </div>
          <div className="flex items-center gap-2">
            <span>SORT BY:</span>
            <button className="flex items-center gap-1 text-white/70 hover:text-white transition-colors">
              Date Added (Newest) <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Document List ─────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16">
        <div className="space-y-4">
          {items.map((doc) => {
            const isMap = doc.fileType?.includes("zip") || doc.mediaCategory?.toLowerCase().includes("spatial");
            
            return (
              <div 
                key={doc.id} 
                className="group flex flex-col sm:flex-row gap-4 p-5 sm:p-6 rounded-xl bg-[#091810] border border-[#132d1f] hover:border-green-900/50 transition-colors"
              >
                {/* Icon */}
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#132d1f] flex items-center justify-center text-green-400 group-hover:bg-green-900/30 group-hover:text-green-300 transition-colors">
                    {isMap ? <MapIcon size={20} /> : <FileText size={20} />}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white/90 mb-2 truncate">
                    {doc.fileName.replace(/\.[^/.]+$/, "")} {/* Strip extension */}
                  </h3>
                  
                  {/* Since description isn't in DB currently, we show a fallback description based on category or filename */}
                  <p className="text-sm text-white/50 mb-4 line-clamp-2">
                    Official document regarding {doc.fileName.replace(/\.[^/.]+$/, "")}. 
                    Belongs to the {doc.mediaCategory || 'General'} category.
                  </p>

                  {/* Meta Tags */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <FileText size={12} className="text-white/30" />
                      {formatDate(doc.createdAt)}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="flex items-center gap-1.5">
                      <Download size={12} className="text-white/30" />
                      {formatFileType(doc.fileType)} ({formatSize(doc.fileSizeKb)})
                    </span>
                    {doc.mediaCategory && (
                      <>
                        <span className="text-white/20">•</span>
                        <span className="text-green-400/70">{doc.mediaCategory}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <div className="shrink-0 sm:self-center mt-4 sm:mt-0 flex justify-end">
                  <a
                    href={doc.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-[#2a4537] flex items-center justify-center text-white/60 hover:text-white hover:bg-green-900/40 hover:border-green-600/50 transition-all"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-20 text-white/40">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>No documents found matching your criteria.</p>
              {(searchQuery || activeCategory) && (
                <Link href="/resources" className="text-green-400 hover:underline mt-2 inline-block">
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Pagination ──────────────────────────────────────── */}
      {totalPages > 1 && (
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex justify-center">
          <div className="flex items-center gap-2">
            {/* Prev */}
            <Link
              href={buildUrl(currentPage - 1, activeCategory, searchQuery)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                currentPage === 0
                  ? "border-[#132d1f] text-white/20 pointer-events-none"
                  : "border-[#2a4537] text-white/60 hover:text-white hover:bg-[#132d1f]"
              }`}
            >
              <ChevronLeft size={18} />
            </Link>

            {/* Pages */}
            {Array.from({ length: totalPages }).map((_, i) => (
              <Link
                key={i}
                href={buildUrl(i, activeCategory, searchQuery)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center font-mono text-sm transition-all ${
                  currentPage === i
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : "border-[#132d1f] text-white/60 hover:text-white hover:border-[#2a4537]"
                }`}
              >
                {i + 1}
              </Link>
            ))}

            {/* Next */}
            <Link
              href={buildUrl(currentPage + 1, activeCategory, searchQuery)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                currentPage === totalPages - 1
                  ? "border-[#132d1f] text-white/20 pointer-events-none"
                  : "border-[#2a4537] text-white/60 hover:text-white hover:bg-[#132d1f]"
              }`}
            >
              <ChevronRight size={18} />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
