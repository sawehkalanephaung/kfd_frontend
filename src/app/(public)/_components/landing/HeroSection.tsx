'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { getMediaUrl } from "@/lib/api";

export default function HeroSection({ siteIdentity, homeContent }: { siteIdentity: any; homeContent?: any }) {
  const title = homeContent?.title || siteIdentity?.organizationName || "Protecting Kawthoolei's Forests for Future Generations";
  const description = homeContent?.content || siteIdentity?.tagline || "The Kawthoolei Forest Department safeguards the interconnected webs of biodiversity and communities through conservation, enforcement, and community partnership.";

  const defaultImage = "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80";
  
  let images: string[] = [];
  if (homeContent?.sliderImageUrls && homeContent.sliderImageUrls.length > 0) {
    images = homeContent.sliderImageUrls;
  } else if (homeContent?.heroImageUrl) {
    images = [homeContent.heroImageUrl];
  } else {
    images = [defaultImage];
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative w-full h-[600px] flex items-center overflow-hidden">
      {/* Background images slider */}
      {images.map((img, idx) => (
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
      ))}

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
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
