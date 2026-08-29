import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getMediaUrl } from '@/lib/api';
import { RESERVED_PAGE_SLUGS } from '@/lib/reserved-pages';

/**
 * Sole content of this page — a real failure throws so error.tsx offers a
 * retry. A 404 means the page just hasn't been created yet (or was
 * deleted) — that's not a backend failure, so it degrades to null like any
 * other "not configured" case instead of hard-erroring the route.
 */
async function getPageData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const res = await fetch(`${baseUrl}/api/v1/public/pages/${slug}`, {
    cache: 'no-store'
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load page "${slug}": ${res.status}`);
  const data = await res.json();
  return data?.data || null;
}

export default async function HistoryPage() {
  const historyData = await getPageData(RESERVED_PAGE_SLUGS.HISTORY);

  const title = historyData?.title || "KFD History";
  const content = historyData?.content || "Information about our history will be updated soon.";
  const bgImage = historyData?.heroImageUrl || historyData?.sliderImageUrls?.[0];
  const displayImage = bgImage ? getMediaUrl(bgImage) : null;
  const sanitizedContent = content ? content.replace(/&nbsp;/g, ' ') : '';

  return (
    <main className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        {displayImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center grayscale-[30%]"
            style={{ backgroundImage: `url('${displayImage}')` }}
          />
        ) : (
          <div className="absolute inset-0 bg-forest" />
        )}
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 drop-shadow-lg tracking-wide">
            {title}
          </h1>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Navigation */}
            <div className="mb-12">
              <Link 
                href="/about" 
                className="inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-forest hover:text-[#e5a93d] transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to About Us
              </Link>
            </div>

            {/* Prose Container */}
            <div className="bg-white p-8 md:p-12 lg:p-16 rounded-2xl shadow-xl shadow-black/5 border border-black/[0.03]">
              <div 
                className="prose prose-lg md:prose-xl max-w-none prose-p:text-[#444] prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-[#111] prose-a:text-forest hover:prose-a:text-[#e5a93d] prose-li:marker:text-forest prose-ul:list-[square] break-words whitespace-pre-wrap [&_*]:!bg-transparent"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
