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
          <h2 className="text-3xl font-bold text-black">Our Department Branches</h2>
          <Link
            href="/departments"
            className="text-sm font-semibold text-black hover:text-black flex items-center gap-1 transition-colors group"
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
            <div
              key={dept.id || index}
              className="bg-canvas border border-hairline rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden"
            >
              {/* Image Section */}
              <div className="relative h-48 bg-surface flex-shrink-0 border-b border-hairline">
                {dept.heroImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getMediaUrl(dept.heroImageUrl)}
                    alt={dept.title || dept.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TreePine size={48} className="text-gray-200" />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-forest mb-4">{dept.title || dept.name}</h3>
                <p className="text-sm text-steel leading-relaxed flex-grow mb-8 line-clamp-4">
                  {extractPlainExcerpt(dept.bodyContent) || "A specialized unit within the Kawthoolei Forestry Department."}
                </p>
                <Link
                  href={`/departments/${dept.slug}`}
                  className="text-sm font-semibold text-ink hover:text-brand-green-dark inline-flex items-center gap-1 group w-fit transition-colors mt-auto"
                >
                  Explore
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        )}

      </div>
    </section>
  );
}
