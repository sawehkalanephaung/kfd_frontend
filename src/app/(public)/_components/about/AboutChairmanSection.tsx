"use client";

import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { getMediaUrl } from "@/lib/api";
import { formatFullDate, formatTenureYears } from "@/lib/date-utils";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function toSentenceCaseHTML(html: string): string {
  if (!html) return html;
  let cleanHtml = html.replace(/&nbsp;/ig, ' ');
  let isInsideTag = false;
  let result = "";
  let newSentence = true;

  for (let i = 0; i < cleanHtml.length; i++) {
    const char = cleanHtml[i];
    if (char === '<') {
      isInsideTag = true;
      result += char;
      continue;
    }
    if (char === '>') {
      isInsideTag = false;
      result += char;
      continue;
    }
    if (isInsideTag) {
      result += char;
    } else {
      if (/[a-zA-Z]/.test(char)) {
        if (newSentence) {
          result += char.toUpperCase();
          newSentence = false;
        } else {
          result += char.toLowerCase();
        }
      } else {
        result += char;
        if (/[\.\!\?]/.test(char)) {
          newSentence = true;
        }
      }
    }
  }
  return result;
}

export default function AboutChairmanSection({ chairmanData }: { chairmanData?: any }) {
  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !portraitRef.current || !bioRef.current) return;

    gsap.fromTo(portraitRef.current,
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true
        }
      }
    );

    gsap.fromTo(bioRef.current,
      { opacity: 0, x: 50 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true
        }
      }
    );
  }, { scope: sectionRef });

  if (!chairmanData) {
    return (
      <section id="chairman" className="py-24 bg-canvas">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif italic text-ink mb-6">Chairman</h2>
          <p className="text-steel">Chairman details will be updated soon.</p>
        </div>
      </section>
    );
  }

  const chairman = chairmanData;
  const displayImage = chairman?.image ? getMediaUrl(chairman.image) : null;

  return (
    <section ref={sectionRef} id="chairman" className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-5xl mx-auto items-center">
          {/* Portrait */}
          <div ref={portraitRef} className="lg:col-span-4 w-full h-[400px] md:h-[500px] relative bg-[#e0e0e0] overflow-hidden rounded-xl shadow-lg group">
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt={chairman.name}
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <User size={64} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Bio Content */}
          <div ref={bioRef} className="lg:col-span-8 flex flex-col justify-center w-full min-w-0">
            <h3 className="text-3xl md:text-4xl font-serif text-[#111] mb-2">{chairman.name}</h3>
            {chairman.title && (
              <p className="text-xs md:text-sm font-bold text-[#e5a93d] uppercase tracking-wider mb-6">
                {chairman.title}
              </p>
            )}
            {chairman.termStartDate && (
              <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
                <div>
                  <span className="block text-[10px] font-bold text-steel uppercase tracking-wider mb-1">First Appointed</span>
                  <span className="text-sm font-semibold text-[#111]">{formatFullDate(chairman.termStartDate)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-steel uppercase tracking-wider mb-1">Tenure Period</span>
                  <span className="text-sm font-semibold text-[#111]">{formatTenureYears(chairman.termStartDate, chairman.termEndDate)}</span>
                </div>
              </div>
            )}
            {chairman.bio && (
              <div
                className="text-[#555] mb-8 text-sm md:text-base leading-relaxed line-clamp-6 prose prose-sm max-w-none break-words whitespace-pre-wrap overflow-hidden [&_*]:!bg-transparent [&_*]:!text-inherit"
                dangerouslySetInnerHTML={{ __html: toSentenceCaseHTML(chairman.bio) }}
              />
            )}
            {chairman.id && (
              <Link
                href={`/team/${chairman.id}`}
                className="inline-flex items-center gap-2 font-bold px-6 py-3 transition-all border border-forest/30 text-forest hover:bg-forest/5 text-sm uppercase tracking-wider w-fit rounded-md"
              >
                READ FULL PROFILE
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
