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

interface CardData {
  title?: string;
  content?: string;
  imageUrl?: string;
  heroImageUrl?: string;
  sliderImageUrls?: string[];
}

export default function AboutMissionVisionSection({ missionData, visionData }: { missionData?: CardData, visionData?: CardData }) {
  const sanitize = (html?: string) => html ? html.replace(/&nbsp;/ig, ' ') : '';

  const renderCard = (data?: CardData, defaultTitle = "Title") => {
    const imageId = data?.heroImageUrl || data?.sliderImageUrls?.[0] || data?.imageUrl;
    const displayImage = imageId ? getMediaUrl(imageId) : null;
    const content = sanitize(data?.content);

    return (
      <div className="bg-white shadow-xl shadow-black/5 flex flex-col h-full opacity-0 translate-y-12 gs-card">
        {/* Top Image */}
        <div className="w-full h-64 md:h-72 relative bg-surface overflow-hidden">
          {displayImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImage}
              alt={data?.title || defaultTitle}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon size={48} className="text-gray-300" />
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-8 md:p-12 flex-1 flex flex-col">
          <h3 className="text-2xl font-bold text-steel-900 mb-6 font-sans tracking-tight">
            {data?.title || defaultTitle}
          </h3>
          <div
            className="text-steel-600 text-sm md:text-base leading-relaxed prose prose-sm max-w-none prose-p:mb-4 break-words whitespace-pre-wrap overflow-hidden [&_*]:!bg-transparent [&_*]:!text-inherit"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const cards = gsap.utils.toArray(".gs-card", containerRef.current);

    gsap.to(cards, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        once: true
      }
    });
  }, { scope: containerRef });

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {renderCard(missionData, "Our Mission")}
          {renderCard(visionData, "Our Vision")}
        </div>
      </div>
    </section>
  );
}
