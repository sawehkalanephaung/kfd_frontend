'use client';

import Link from "next/link";
import { ArrowRight, TreePine } from "lucide-react";
import { getMediaUrl } from "@/lib/api";
import { extractPlainExcerpt } from "@/lib/rich-text";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ContentFallback } from "@/components/content-fallback";
import { Card } from "@/components/ui/card";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function DepartmentsSection({ departments, status }: { departments: any[]; status: 'ok' | 'empty' | 'error' }) {
  const displayDepartments = departments || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (status === 'empty' || !containerRef.current || !headerRef.current) return;

    // Animate Header
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          once: true
        }
      }
    );

    // Stagger Cards
    const cards = containerRef.current.children;
    gsap.fromTo(cards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          once: true
        }
      }
    );
  }, { scope: containerRef });

  if (status === 'empty') return null;

  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <h2 className="text-3xl font-bold text-white">Our Department Branches</h2>
          <Link
            href="/departments"
            className="text-sm font-semibold text-ink hover:text-brand-green-dark flex items-center gap-1 transition-colors group"
          >
            View All Department Branches
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards Grid */}
        {status === 'error' ? (
          <ContentFallback variant="error" title="Departments unavailable" message="We couldn't load department branches right now." />
        ) : (
          <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayDepartments.slice(0, 4).map((dept, index) => (
              <Card
                key={dept.id || index}
                href={`/departments/${dept.slug}`}
                imageUrl={dept.heroImageUrl ? getMediaUrl(dept.heroImageUrl) : null}
                imageAlt={dept.title || dept.name}
                fallbackIcon={TreePine}
                title={dept.title || dept.name}
                description={extractPlainExcerpt(dept.bodyContent) || "A specialized unit within the Kawthoolei Forestry Department."}
                footerLabel="Explore"
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
