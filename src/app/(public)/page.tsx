import React from 'react';
import HeroSection from './_components/landing/HeroSection';
import StatsSection from './_components/landing/StatsSection';
import DepartmentsSection from './_components/landing/DepartmentsSection';
import NewsSection from './_components/landing/NewsSection';
import FAQSection from './_components/landing/FAQSection';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchSiteIdentity() {
  try {
    const res = await fetch(`${API}/api/v1/public/site-identity`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json())?.data || null;
  } catch {
    return null;
  }
}

async function fetchMetrics() {
  try {
    const res = await fetch(`${API}/api/v1/public/metrics`, { next: { revalidate: 60 } });
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
    const res = await fetch(`${API}/api/v1/public/posts?page=0&size=3`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json())?.data?.content || [];
  } catch {
    return [];
  }
}

async function fetchFaqs() {
  try {
    const res = await fetch(`${API}/api/faqs`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data || []);
  } catch {
    return [];
  }
}

async function fetchHomeContent() {
  try {
    const res = await fetch(`${API}/api/v1/public/pages/home`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json())?.data || null;
  } catch {
    return null;
  }
}

export default async function PublicHome() {
  const [siteIdentity, metrics, departments, news, faqs, homeContent] = await Promise.all([
    fetchSiteIdentity(),
    fetchMetrics(),
    fetchDepartments(),
    fetchNews(),
    fetchFaqs(),
    fetchHomeContent(),
  ]);

  return (
    <>
      <HeroSection siteIdentity={siteIdentity} homeContent={homeContent} />
      <StatsSection metrics={metrics} />
      <DepartmentsSection departments={departments} />
      <NewsSection news={news} />
      <FAQSection faqs={faqs} />
    </>
  );
}
