'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Public_Sans } from 'next/font/google';
import { Search, LayoutGrid, List as ListIcon, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentFallback } from '@/components/content-fallback';
import { PublicationItem, PublicationCategory } from './types';

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const PAGE_SIZE = 9;

function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
}

interface Props {
  publications: PublicationItem[];
  categories: PublicationCategory[];
}

export default function PublicationsExplorer({ publications, categories }: Props) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [organizers, setOrganizers] = useState<Set<string>>(new Set());
  const [languages, setLanguages] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const organizerOptions = useMemo(
    () => Array.from(new Set(publications.map(p => p.issuedBy).filter((v): v is string => !!v))).sort(),
    [publications]
  );
  const languageOptions = useMemo(
    () => Array.from(new Set(publications.map(p => p.language).filter((v): v is string => !!v))).sort(),
    [publications]
  );

  const toggleSetValue = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setCategorySlug('');
    setOrganizers(new Set());
    setLanguages(new Set());
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publications.filter(p => {
      if (categorySlug && p.category?.slug !== categorySlug) return false;
      if (organizers.size > 0 && (!p.issuedBy || !organizers.has(p.issuedBy))) return false;
      if (languages.size > 0 && (!p.language || !languages.has(p.language))) return false;
      if (q && !p.title.toLowerCase().includes(q) && !(p.summary || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [publications, categorySlug, organizers, languages, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilters = !!search || !!categorySlug || organizers.size > 0 || languages.size > 0;

  const meta = (pub: PublicationItem) => {
    const rows: { label: string; value: string }[] = [];
    if (pub.publishedDate) rows.push({ label: 'Published', value: formatDate(pub.publishedDate) });
    if (pub.issuedBy) rows.push({ label: 'Issued by', value: pub.issuedBy });
    if (pub.language) rows.push({ label: 'Language', value: pub.language });
    return rows;
  };

  const Thumbnail = ({ pub, className }: { pub: PublicationItem; className: string }) => (
    <div className={`relative bg-[#eef1f5] flex items-center justify-center flex-shrink-0 ${className}`}>
      {pub.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={getMediaUrl(pub.thumbnailUrl)} alt={pub.title} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <FileText size={28} className="text-[#9aa6ba]" />
      )}
      {pub.category && (
        <div className="absolute top-3 left-3">
          <span className="text-[11.5px] font-bold text-white bg-[#001E2B] rounded-md px-3 py-[5px] tracking-wide uppercase shadow-[0_2px_6px_rgba(0,0,0,.18)]">
            {pub.category.name}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${publicSans.className} bg-[#F9FBFA] text-[#1a2231]`}>
      <div className="max-w-[1280px] mx-auto px-5 sm:px-7 py-8 pb-16 grid grid-cols-1 lg:grid-cols-[236px_minmax(0,1fr)] gap-8 lg:gap-10 items-start">

        {/* sidebar */}
        <aside>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="m-0 text-2xl font-extrabold text-[#00684A] tracking-tight">Filters</h2>
            <button onClick={resetFilters} className="text-[13px] text-[#8290a6] font-medium hover:text-[#00684A] transition-colors">
              Reset filters
            </button>
          </div>

          {/* Category */}
          <div className="border-t border-[#e4e8ef] py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#023430] tracking-wide">Category</span>
            </div>
            <label className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm" style={{ color: categorySlug === '' ? '#00684A' : '#1a2231', fontWeight: categorySlug === '' ? 600 : 500 }}>
              <input type="radio" checked={categorySlug === ''} onChange={() => { setCategorySlug(''); setPage(1); }} className="accent-[#00684A] w-[17px] h-[17px]" />
              All Categories
            </label>
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm" style={{ color: categorySlug === cat.slug ? '#00684A' : '#1a2231', fontWeight: categorySlug === cat.slug ? 600 : 500 }}>
                <input type="radio" checked={categorySlug === cat.slug} onChange={() => { setCategorySlug(cat.slug); setPage(1); }} className="accent-[#00684A] w-[17px] h-[17px]" />
                {cat.name}
              </label>
            ))}
          </div>

          {/* Organizer */}
          <div className="border-t border-[#e4e8ef] py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#023430] tracking-wide">Organizer</span>
            </div>
            {organizerOptions.length > 0 ? (
              organizerOptions.map(org => (
                <label key={org} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-[#1a2231]">
                  <input
                    type="checkbox"
                    checked={organizers.has(org)}
                    onChange={() => toggleSetValue(organizers, org, setOrganizers)}
                    className="accent-[#00684A] w-[17px] h-[17px] rounded"
                  />
                  {org}
                </label>
              ))
            ) : (
              <p className="text-xs text-[#9aa6ba]">No organizers yet.</p>
            )}
          </div>

          {/* Language */}
          <div className="border-t border-[#e4e8ef] py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#023430] tracking-wide">Language</span>
            </div>
            {languageOptions.length > 0 ? (
              languageOptions.map(lang => (
                <label key={lang} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-[#1a2231]">
                  <input
                    type="checkbox"
                    checked={languages.has(lang)}
                    onChange={() => toggleSetValue(languages, lang, setLanguages)}
                    className="accent-[#00684A] w-[17px] h-[17px] rounded"
                  />
                  {lang}
                </label>
              ))
            ) : (
              <p className="text-xs text-[#9aa6ba]">No languages yet.</p>
            )}
          </div>
        </aside>

        {/* content */}
        <div>
          {/* toolbar */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 flex items-center gap-3 bg-white border border-[#dce1ea] rounded-xl px-4 h-[52px] shadow-[0_1px_2px_rgba(15,31,61,.04)]">
              <Search size={17} className="text-[#9aa6ba] flex-shrink-0" />
              <input
                placeholder="Search publications…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="border-0 outline-none w-full h-full text-[15px] bg-transparent text-[#1a2231] placeholder:text-[#9aa6ba]"
              />
            </div>
            <button
              onClick={() => setView('grid')}
              aria-label="Grid view"
              className="w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              style={view === 'grid' ? { border: 0, background: '#00684A', color: '#fff' } : { border: '1px solid #dce1ea', background: '#fff', color: '#5a677d' }}
            >
              <LayoutGrid size={19} />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="List view"
              className="w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              style={view === 'list' ? { border: 0, background: '#00684A', color: '#fff' } : { border: '1px solid #dce1ea', background: '#fff', color: '#5a677d' }}
            >
              <ListIcon size={19} />
            </button>
          </div>

          {/* results */}
          {pageItems.length === 0 ? (
            <div className="border border-[#e6e9ef] rounded-2xl bg-white">
              <ContentFallback
                variant="empty"
                icon={FileText}
                title={hasActiveFilters ? 'No publications match your filters' : 'No publications yet'}
                message={hasActiveFilters ? 'Try adjusting or resetting your filters.' : 'Published documents will appear here once they’re added.'}
              />
              {hasActiveFilters && (
                <p className="text-center pb-8 -mt-2">
                  <button onClick={resetFilters} className="text-[#00684A] text-sm font-bold hover:underline">
                    Reset filters
                  </button>
                </p>
              )}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageItems.map(pub => (
                <Link
                  key={pub.id}
                  href={`/resources/${pub.slug}`}
                  className="bg-white border border-[#e6e9ef] rounded-[14px] overflow-hidden shadow-[0_1px_3px_rgba(15,31,61,.05)] flex flex-col hover:shadow-[0_6px_20px_-8px_rgba(15,31,61,.15)] transition-shadow"
                >
                  <Thumbnail pub={pub} className="aspect-[16/10] w-full" />
                  <div className="p-5 pb-6 flex flex-col flex-1">
                    <h3 className="m-0 mb-3 text-[21px] font-extrabold leading-tight text-[#023430] tracking-tight text-pretty">{pub.title}</h3>
                    {pub.summary && <p className="m-0 mb-4 text-[14.5px] leading-relaxed text-[#57637a] text-pretty line-clamp-3">{pub.summary}</p>}
                    <dl className="mt-auto pt-3.5 border-t border-[#eef1f6] grid grid-cols-[auto_1fr] gap-y-1.5 gap-x-3.5">
                      {meta(pub).map(m => (
                        <React.Fragment key={m.label}>
                          <dt className="text-[11px] font-bold tracking-wide uppercase text-[#8290a6] self-center">{m.label}</dt>
                          <dd className="m-0 text-[13.5px] font-semibold text-[#1a2231] truncate">{m.value}</dd>
                        </React.Fragment>
                      ))}
                    </dl>
                    <div className="mt-3.5 text-[13.5px] font-bold text-[#00684A]">Read more →</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pageItems.map(pub => (
                <Link
                  key={pub.id}
                  href={`/resources/${pub.slug}`}
                  className="bg-white border border-[#e6e9ef] rounded-[14px] overflow-hidden shadow-[0_1px_3px_rgba(15,31,61,.05)] grid grid-cols-1 sm:grid-cols-[264px_minmax(0,1fr)] hover:shadow-[0_6px_20px_-8px_rgba(15,31,61,.15)] transition-shadow"
                >
                  <Thumbnail pub={pub} className="aspect-[16/10] sm:aspect-auto w-full h-full min-h-[160px]" />
                  <div className="p-6 flex flex-col justify-center gap-2.5">
                    <h3 className="m-0 text-[22px] font-extrabold leading-tight text-[#023430] tracking-tight text-pretty">{pub.title}</h3>
                    {pub.summary && <p className="m-0 text-[14.5px] leading-relaxed text-[#57637a] max-w-[70ch] text-pretty">{pub.summary}</p>}
                    <dl className="mt-1.5 pt-3.5 border-t border-[#eef1f6] flex gap-8 flex-wrap">
                      {meta(pub).map(m => (
                        <div key={m.label}>
                          <dt className="text-[11px] font-bold tracking-wide uppercase text-[#8290a6]">{m.label}</dt>
                          <dd className="m-0 mt-0.5 text-sm font-semibold text-[#1a2231]">{m.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-1 text-[13.5px] font-bold text-[#00684A]">Read more →</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-9">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="min-w-[44px] h-[44px] px-3 rounded-[9px] border border-[#dce1ea] bg-white text-[#00684A] font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === currentPage ? 'page' : undefined}
                  className="min-w-[44px] h-[44px] px-3.5 rounded-[9px] text-[14.5px] font-bold flex items-center justify-center transition-colors"
                  style={p === currentPage ? { border: 0, background: '#00684A', color: '#fff' } : { border: '1px solid #dce1ea', background: '#fff', color: '#00684A' }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="min-w-[44px] h-[44px] px-3 rounded-[9px] border border-[#dce1ea] bg-white text-[#00684A] font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
