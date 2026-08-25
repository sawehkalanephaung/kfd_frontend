/**
 * Public Home Page (Server-Side Rendered)
 * 
 * This page aggregates data from multiple backend endpoints to construct the landing page.
 * It uses Next.js fetch caching strategies tailored to the volatility of each data type:
 * - Static/Slow-changing data (Site Identity, Metrics, Home Content): Cached for 1 hour (`revalidate: 3600`).
 * - Editorial data (News, Events, FAQs): Fetched dynamically (`cache: 'no-store'`) so admin updates reflect instantly.
 */
import React from 'react';
import HeroSection from './_components/landing/HeroSection';
import StatsSection from './_components/landing/StatsSection';
import DepartmentsSection from './_components/landing/DepartmentsSection';
import NewsSection from './_components/landing/NewsSection';
import FAQSection from './_components/landing/FAQSection';
import { getSiteIdentity } from '@/lib/site-identity';
import { fetchPublicList, type FetchOutcome } from '@/lib/public-fetch';
import { RESERVED_PAGE_SLUGS } from '@/lib/reserved-pages';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Each of these returns a 3-way outcome (ok / empty / error) instead of
// collapsing a real backend failure and "nothing configured yet" into the
// same []. The home page aggregates independent sections, so no single one
// is allowed to throw and take the rest of the page down with it — each
// section decides for itself how to render an 'error' outcome.

function fetchMetrics() {
  // Metrics (stats counters) rarely change — cache for 1 hour
  return fetchPublicList(`${API}/api/v1/public/metrics`, (json) => json?.data || [], { next: { revalidate: 3600 } });
}

function fetchDepartments() {
  return fetchPublicList(
    `${API}/api/v1/public/departments?page=0&size=4`,
    (json) => json.content || json.data || (Array.isArray(json) ? json : []),
    { cache: 'no-store' }
  );
}

function fetchNews() {
  // Posts are editorial content — no-store for instant publish feedback
  return fetchPublicList(`${API}/api/v1/public/posts?page=0&size=3`, (json) => json?.data?.content || [], { cache: 'no-store' });
}

function fetchFaqs() {
  // FAQs are editorial content — no-store so admin changes reflect instantly
  return fetchPublicList(
    `${API}/api/v1/public/faqs`,
    (json) => (Array.isArray(json) ? json : (json.data || [])),
    { cache: 'no-store' }
  );
}

async function fetchHomeContent() {
  try {
    // Home page static content rarely changes — cache for 1 hour
    const res = await fetch(`${API}/api/v1/public/pages/${RESERVED_PAGE_SLUGS.HOME}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json())?.data || null;
  } catch {
    return null;
  }
}

async function fetchNotices(): Promise<FetchOutcome<any[]>> {
  try {
    // Notices (events/announcements) are editorial — no-store for instant updates
    const [eventsRes, announcementsRes] = await Promise.all([
      fetch(`${API}/api/v1/public/posts?page=0&size=2&categorySlug=event`, { cache: 'no-store' }),
      fetch(`${API}/api/v1/public/posts?page=0&size=2&categorySlug=announcement`, { cache: 'no-store' })
    ]);

    // Both endpoints failing means the feed is actually down, not just
    // "no events/announcements published" — surface that distinctly.
    if (!eventsRes.ok && !announcementsRes.ok) return { status: 'error' };

    const events = eventsRes.ok ? (await eventsRes.json())?.data?.content || [] : [];
    const announcements = announcementsRes.ok ? (await announcementsRes.json())?.data?.content || [] : [];

    const combined = [...events, ...announcements].sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    }).slice(0, 3);

    return combined.length === 0 ? { status: 'empty' } : { status: 'ok', data: combined };
  } catch {
    return { status: 'error' };
  }
}

export default async function PublicHome() {
  const [siteIdentity, metricsOutcome, departmentsOutcome, newsOutcome, faqsOutcome, homeContent, noticesOutcome] = await Promise.all([
    getSiteIdentity(),
    fetchMetrics(),
    fetchDepartments(),
    fetchNews(),
    fetchFaqs(),
    fetchHomeContent(),
    fetchNotices(),
  ]);

  const emptyList: any[] = [];

  return (
    <>
      <HeroSection siteIdentity={siteIdentity} homeContent={homeContent} />
      <StatsSection
        metrics={metricsOutcome.status === 'ok' ? metricsOutcome.data : emptyList}
        status={metricsOutcome.status}
      />
      <DepartmentsSection
        departments={departmentsOutcome.status === 'ok' ? departmentsOutcome.data : emptyList}
        status={departmentsOutcome.status}
      />
      <NewsSection
        news={newsOutcome.status === 'ok' ? newsOutcome.data : emptyList}
        notices={noticesOutcome.status === 'ok' ? noticesOutcome.data : emptyList}
        newsStatus={newsOutcome.status}
        noticesStatus={noticesOutcome.status}
      />
      <FAQSection
        faqs={faqsOutcome.status === 'ok' ? faqsOutcome.data : emptyList}
        status={faqsOutcome.status}
      />
    </>
  );
}
