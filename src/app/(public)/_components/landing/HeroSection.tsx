'use client';

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import { getMediaUrl } from "@/lib/api";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { Button } from "@/components/ui/button";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function HeroSection({ siteIdentity, homeContent }: { siteIdentity: any; homeContent?: any }) {
  // organizationName is always non-empty (lib/site-identity.ts guarantees a
  // fallback), so there's no reachable case where title needs its own
  // hardcoded string. description has no such guarantee — omit the
  // paragraph rather than show fabricated mission copy when it's unset.
  const title = homeContent?.title || siteIdentity?.organizationName;
  const description = homeContent?.content || siteIdentity?.tagline || "";

  let images: string[] = [];
  if (homeContent?.sliderImageUrls && homeContent.sliderImageUrls.length > 0) {
    images = homeContent.sliderImageUrls;
  } else if (homeContent?.heroImageUrl) {
    images = [homeContent.heroImageUrl];
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Auto-advance starts paused for anyone who asked the OS for reduced
  // motion, and is otherwise pausable via the control rendered below -
  // WCAG 2.2.2 requires a way to stop content that auto-updates past 5s.
  const [isPaused, setIsPaused] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) setIsPaused(true);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length, isPaused]);

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion) {
      // Skip straight to the animations' end state instead of leaving
      // elements at their pre-animation opacity-0/offset starting values.
      if (contentRef.current) gsap.set(contentRef.current.children, { y: 0, opacity: 1 });
      return;
    }

    // Parallax background
    if (bgRef.current && sectionRef.current) {
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
    }

    // Staggered text entry
    if (contentRef.current) {
      const elements = contentRef.current.children;
      gsap.fromTo(elements,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.2
        }
      );
    }
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} className="relative w-full h-150 flex items-center overflow-hidden bg-forest-900">
      {/* Background images slider with Parallax wrapper */}
      <div ref={bgRef} className="absolute inset-0 z-0 w-full h-[130%] top-[-15%]">
        {images.length > 0 ? (
          images.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 z-0 overflow-hidden transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <div
                className={`w-full h-full bg-cover bg-center transition-transform ease-out ${idx === currentIndex ? 'scale-105' : 'scale-100'}`}
                style={{
                  backgroundImage: `url('${getMediaUrl(img)}')`,
                  transitionDuration: idx === currentIndex ? '10000ms' : '0ms'
                }}
              />
              <div className="absolute inset-0 bg-linear-to-r from-teal-deep/90 via-teal-deep/70 to-transparent"></div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 z-0 bg-forest-900">
            <div className="absolute inset-0 bg-linear-to-r from-teal-deep/90 via-teal-deep/70 to-transparent"></div>
          </div>
        )}
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={contentRef} className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {title}
          </h1>

          {description && (
            <div
              className="text-lg text-on-dark-muted mb-10 max-w-xl leading-relaxed rich-text whitespace-normal"
              dangerouslySetInnerHTML={{ __html: typeof description === 'string' ? description.replace(/&nbsp;/g, ' ') : description }}
            />
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Button href="/news">
              Explore Our Work
            </Button>
            <Link
              href="/about"
              className="bg-transparent border border-white text-white hover:bg-canvas/10 font-medium px-8 py-3.5 rounded-full transition-all duration-200 ease-in-out"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel dots + pause control */}
      {images.length > 1 && (
        <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
          <div className="flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-canvas' : 'bg-canvas/40 hover:bg-canvas/60'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
            aria-pressed={isPaused}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-canvas/10 hover:bg-canvas/20 text-canvas transition-colors outline-none focus-visible:ring-2 focus-visible:ring-canvas/60"
          >
            {isPaused ? <Play className="w-3 h-3" aria-hidden="true" /> : <Pause className="w-3 h-3" aria-hidden="true" />}
          </button>
        </div>
      )}
    </section>
  );
}
