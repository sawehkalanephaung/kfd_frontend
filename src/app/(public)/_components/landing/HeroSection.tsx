'use client';

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getMediaUrl } from "@/lib/api";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function HeroSection({ siteIdentity, homeContent }: { siteIdentity: any; homeContent?: any }) {
  const title = homeContent?.title || siteIdentity?.organizationName || "Protecting Kawthoolei's Forests for Future Generations";
  const description = homeContent?.content || siteIdentity?.tagline || "The Kawthoolei Forest Department safeguards the interconnected webs of biodiversity and communities through conservation, enforcement, and community partnership.";

  let images: string[] = [];
  if (homeContent?.sliderImageUrls && homeContent.sliderImageUrls.length > 0) {
    images = homeContent.sliderImageUrls;
  } else if (homeContent?.heroImageUrl) {
    images = [homeContent.heroImageUrl];
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
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
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative w-full h-[600px] flex items-center overflow-hidden bg-[#0d1f15]">
      {/* Background images slider with Parallax wrapper */}
      <div ref={bgRef} className="absolute inset-0 z-0 w-full h-[130%] -top-[15%]">
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
              <div className="absolute inset-0 bg-gradient-to-r from-teal-deep/90 via-teal-deep/70 to-transparent"></div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 z-0 bg-[#0d1f15]">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-deep/90 via-teal-deep/70 to-transparent"></div>
          </div>
        )}
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={contentRef} className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {title}
          </h1>

          <div
            className="text-lg text-on-dark-muted mb-10 max-w-xl leading-relaxed"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/news"
              className="bg-brand-green hover:bg-primary-deep text-on-primary font-medium px-8 py-3.5 rounded-full transition-colors"
            >
              Explore Our Work
            </Link>
            <Link
              href="/about"
              className="bg-transparent border border-white text-white hover:bg-canvas/10 font-medium px-8 py-3.5 rounded-full transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel dots */}
      {images.length > 0 && (
        <div className="absolute bottom-8 right-8 z-10 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-canvas' : 'bg-canvas/40 hover:bg-canvas/60'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
