"use client";

import Link from "next/link";
import { ArrowRight, Bell, CalendarDays } from "lucide-react";
import { getMediaUrl } from "@/lib/api";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ContentFallback } from "@/components/content-fallback";
import { Card } from "@/components/ui/card";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type SectionStatus = 'ok' | 'empty' | 'error';

export default function NewsSection({
  news,
  notices,
  newsStatus,
  noticesStatus,
}: {
  news: any[];
  notices?: any[];
  newsStatus: SectionStatus;
  noticesStatus: SectionStatus;
}) {
  const displayNews = news || [];
  const displayNotices = notices || [];

  const sectionRef = useRef<HTMLElement>(null);
  const newsContainerRef = useRef<HTMLDivElement>(null);
  const noticesContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if ((newsStatus === 'empty' && noticesStatus === 'empty') || !sectionRef.current) return;

    // Animate News Cards
    if (newsContainerRef.current) {
      const newsCards = gsap.utils.toArray(".gs-news-card", newsContainerRef.current);
      gsap.fromTo(newsCards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: newsContainerRef.current,
            start: "top 85%",
            once: true
          }
        }
      );
    }

    // Animate Notices List
    if (noticesContainerRef.current) {
      const noticeItems = gsap.utils.toArray(".gs-notice-item", noticesContainerRef.current);
      gsap.fromTo(noticeItems,
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.3,
          scrollTrigger: {
            trigger: noticesContainerRef.current,
            start: "top 85%",
            once: true
          }
        }
      );
    }

  }, { scope: sectionRef });

  // Both columns render independently — one feed failing shouldn't hide the other.
  if (newsStatus === 'empty' && noticesStatus === 'empty') return null;

  return (
    <section ref={sectionRef} className="py-20 bg-canvas border-t border-hairline overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column: Latest News */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <h2 className="text-3xl font-bold text-ink">Latest News</h2>
              <Link
                href="/news"
                className="text-sm font-semibold text-steel hover:text-teal-deep flex items-center gap-1 transition-colors group"
              >
                View All News
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {newsStatus === 'error' ? (
              <ContentFallback variant="error" title="News unavailable" message="We couldn't load the latest news right now." />
            ) : newsStatus === 'empty' ? (
              <ContentFallback variant="empty" title="No news yet" message="Check back soon for updates." />
            ) : (
            <div ref={newsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {displayNews.slice(0, 2).map((item, index) => {
                const dateStr = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : item.date;
                const catName = item.category?.name || item.category;
                const imgUrl = item.featuredImageUrl ? getMediaUrl(item.featuredImageUrl) : item.featuredImage || item.image;
                // Previously this card was a plain <div> with this link
                // computed but never applied - the whole card was
                // unclickable dead UI. Card fixes that as a side effect.
                const itemLink = item.slug ? `/news/${item.slug}` : item.link;

                return (
                  <Card
                    key={item.id || index}
                    className="gs-news-card"
                    href={itemLink}
                    imageUrl={imgUrl}
                    imageAlt={item.title}
                    badge={catName}
                    title={item.title}
                    description={item.excerpt}
                    meta={[{ icon: CalendarDays, label: dateStr }]}
                    metaStyle="inline"
                  />
                );
              })}
            </div>
            )}
          </div>

          {/* Right Column: Announcements & Events */}
          <div className="lg:col-span-1 flex flex-col">
            <h2 className="text-2xl font-bold text-ink mb-8">Announcements & Events</h2>

            {noticesStatus === 'error' ? (
              <div className="bg-surface border border-hairline rounded-2xl flex-grow flex items-center">
                <ContentFallback variant="error" title="Unavailable" message="We couldn't load announcements or events right now." className="py-8" />
              </div>
            ) : noticesStatus === 'empty' ? (
              <div className="bg-surface border border-hairline rounded-2xl flex-grow flex items-center">
                <ContentFallback variant="empty" title="Nothing scheduled" message="No announcements or events right now." className="py-8" />
              </div>
            ) : (
            <div ref={noticesContainerRef} className="bg-surface border border-hairline rounded-2xl p-6 flex flex-col gap-6 flex-grow">
              {displayNotices.map((notice) => {
                const isReal = !!notice.category;
                const type = isReal ? notice.category.name : notice.type;
                const title = isReal ? notice.title : notice.title;
                const link = isReal ? `/news/${notice.slug}` : notice.link;

                // Use eventDate if it's an event, else publishedAt
                let dateStr = notice.date;
                if (isReal) {
                  const isEvent = notice.category?.slug?.toLowerCase() === 'event';
                  const dateObj = isEvent && notice.metadata?.eventDate
                    ? new Date(notice.metadata.eventDate)
                    : new Date(notice.publishedAt || notice.createdAt);
                  dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
                }

                return (
                  <Link
                    key={notice.id}
                    href={link}
                    className="group flex gap-4 p-4 -mx-4 rounded-xl hover:bg-canvas hover:shadow-sm transition-all gs-notice-item"
                  >
                    <div className="w-10 h-10 rounded-full bg-canvas shadow-sm border border-hairline flex items-center justify-center shrink-0 group-hover:bg-surface-soft group-hover:border-green-100 group-hover:text-brand-green-dark transition-colors text-muted">
                      {(type === "Event" || type?.toLowerCase() === "event") ? <CalendarDays size={18} /> : <Bell size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${(type === "Event" || type?.toLowerCase() === "event") ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          }`}>
                          {type}
                        </span>
                        <span className="text-xs text-steel font-medium">{dateStr}</span>
                      </div>
                      <h4 className="text-sm font-bold text-ink leading-snug group-hover:text-brand-green-dark transition-colors line-clamp-2">
                        {title}
                      </h4>
                    </div>
                  </Link>
                );
              })}

              <div className="mt-auto pt-4 border-t border-hairline-strong/60 flex justify-between gs-notice-item">
                <Link href="/news/announcements" className="text-xs font-semibold text-[#2a563c] hover:underline">
                  All Announcements
                </Link>
                <Link href="/news/events" className="text-xs font-semibold text-[#2a563c] hover:underline">
                  All Events
                </Link>
              </div>
            </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
