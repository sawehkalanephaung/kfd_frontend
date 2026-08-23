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

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";


async function fetchMetrics() {
  try {
    // Metrics (stats counters) rarely change — cache for 1 hour
    const res = await fetch(`${API}/api/v1/public/metrics`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return (await res.json())?.data || [];
  } catch {
    return [];
  }
}

async function fetchDepartments() {
  try {
    const res = await fetch(`${API}/api/v1/public/departments?page=0&size=4`, { cache: 'no-store' });
    if (!res.ok) return [];
    const responseData = await res.json();
    return responseData.content || responseData.data || (Array.isArray(responseData) ? responseData : []);
  } catch {
    return [];
  }
}

async function fetchNews() {
  try {
    // Posts are editorial content — no-store for instant publish feedback
    const res = await fetch(`${API}/api/v1/public/posts?page=0&size=3`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json())?.data?.content || [];
  } catch {
    return [];
  }
}

async function fetchFaqs() {
  try {
    // FAQs are editorial content — no-store so admin changes reflect instantly
    const res = await fetch(`${API}/api/v1/public/faqs`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data || []);
  } catch {
    return [];
  }
}

async function fetchHomeContent() {
  try {
    // Home page static content rarely changes — cache for 1 hour
    const res = await fetch(`${API}/api/v1/public/pages/home`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json())?.data || null;
  } catch {
    return null;
  }
}

async function fetchNotices() {
  try {
    // Notices (events/announcements) are editorial — no-store for instant updates
    const [eventsRes, announcementsRes] = await Promise.all([
      fetch(`${API}/api/v1/public/posts?page=0&size=2&categorySlug=event`, { cache: 'no-store' }),
      fetch(`${API}/api/v1/public/posts?page=0&size=2&categorySlug=announcement`, { cache: 'no-store' })
    ]);
    
    const events = eventsRes.ok ? (await eventsRes.json())?.data?.content || [] : [];
    const announcements = announcementsRes.ok ? (await announcementsRes.json())?.data?.content || [] : [];
    
    // Combine and sort by publishedAt descending
    const combined = [...events, ...announcements].sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
    
    return combined.slice(0, 3); // Take top 3
  } catch {
    return [];
  }
}

export default async function PublicHome() {
  const [siteIdentity, metrics, departments, news, faqs, homeContent, notices] = await Promise.all([
    getSiteIdentity(),
    fetchMetrics(),
    fetchDepartments(),
    fetchNews(),
    fetchFaqs(),
    fetchHomeContent(),
    fetchNotices(),
  ]);

  return (
    <>
      <HeroSection siteIdentity={siteIdentity} homeContent={homeContent} />
      <StatsSection metrics={metrics} />
      <DepartmentsSection departments={departments} />
      <NewsSection news={news} notices={notices} />
      <FAQSection faqs={faqs} />
    </>
  );
}
