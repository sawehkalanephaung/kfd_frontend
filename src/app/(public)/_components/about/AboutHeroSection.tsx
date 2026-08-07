"use client";

import { getMediaUrl } from "@/lib/api";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function AboutHeroSection({
  title,
  tagline,
  bgImage
}: {
  title?: string,
  tagline?: string,
  bgImage?: string
}) {
  const displayImage = bgImage ? getMediaUrl(bgImage) : null;
  const sanitizedTagline = tagline ? tagline.replace(/&nbsp;/ig, ' ') : '';
  
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!contentRef.current || !sectionRef.current || !bgRef.current) return;

    // Background parallax
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

    // Staggered text entry
    const elements = contentRef.current.children;
    gsap.fromTo(elements,
      { y: 50, opacity: 0, clipPath: "inset(0% 0% 100% 0%)" },
      {
        y: 0,
        opacity: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.1
      }
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative w-full min-h-[600px] flex items-center bg-[#0d1f15] overflow-hidden">
      {/* Background Image */}
      <div ref={bgRef} className="absolute inset-0 z-0 w-full h-[130%] -top-[15%]">
        {displayImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${displayImage}')` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <ImageIcon size={120} className="text-white" />
          </div>
        )}
      </div>
      {/* Gradient Overlay for Left-Aligned Text */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex justify-start py-20">
        <div ref={contentRef} className="max-w-2xl">
          <h1
            className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-md font-sans tracking-tight"
            dangerouslySetInnerHTML={{ __html: title || "About KFD" }}
          />
          <div
            className="text-base md:text-lg text-white/90 leading-relaxed font-normal drop-shadow-md prose prose-invert prose-p:mb-0 max-w-none break-words whitespace-pre-wrap overflow-hidden [&_*]:!bg-transparent [&_*]:!text-inherit"
            dangerouslySetInnerHTML={{ __html: sanitizedTagline || "Protecting and sustainably managing the forests of Kawthoolei for present and future generations." }}
          />
        </div>
      </div>
    </section>
  );
}
