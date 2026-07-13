'use client';
import React, { useState } from 'react';
import { getMediaUrl } from '@/lib/api';
import { ChevronDown, ChevronUp, ImageIcon } from 'lucide-react';

interface AboutContentSectionProps {
  title: string;
  content: string;
  variant?: 'split' | 'fullbleed';
  imageUrl?: string;
  imageAlignment?: 'left' | 'right';
  textAlignment?: 'left' | 'right';
  enableSeeMore?: boolean;
  bgVariant?: 'light' | 'dark' | 'white';
}

export default function AboutContentSection({
  title,
  content,
  variant = 'split',
  bgVariant = 'white',
  imageUrl,
  imageAlignment = 'right',
  textAlignment = 'left',
  enableSeeMore = false
}: AboutContentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayImage = imageUrl ? getMediaUrl(imageUrl) : null;

  const sanitizedContent = content ? content.replace(/&nbsp;/g, ' ') : '';

  const isLongContent = sanitizedContent.length > 500;
  const showSeeMoreButton = enableSeeMore && isLongContent;

  // ── Full-bleed variant: image covers entire background, text floats over it ──
  if (variant === 'fullbleed') {
    return (
      <section className="relative w-full min-h-[550px] lg:min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        {displayImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${displayImage}')` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f15] to-[#1a3626]" />
        )}
        {/* Lighter overlay to let the glassmorphism card stand out */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex ${textAlignment === 'right' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-xl lg:max-w-lg p-8 md:p-10 rounded-3xl bg-black/30 backdrop-blur-sm border border-white/5 shadow-2xl" data-aos="fade-up">
              <h2 className="text-4xl md:text-5xl font-serif italic text-white mb-6 drop-shadow-lg">
                {title}
              </h2>
              <div
                className="text-white/90 text-lg leading-relaxed prose prose-invert max-w-none prose-p:mb-4 drop-shadow-md break-words whitespace-pre-wrap [&_*]:!bg-transparent [&_*]:!text-inherit"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Split variant: side-by-side image + text ──
  let sectionBg = "bg-canvas";
  let titleColor = "text-[#1a3626]";
  let textColor = "text-steel";
  let gradientFrom = "from-white";

  if (bgVariant === 'light') {
    sectionBg = "bg-[#f7f9f7]";
    gradientFrom = "from-[#f7f9f7]";
  } else if (bgVariant === 'dark') {
    sectionBg = "bg-[#0d1f15]";
    titleColor = "text-white";
    textColor = "text-white/80";
    gradientFrom = "from-[#0d1f15]";
  }

  const contentBlock = (
    <div
      className="flex flex-col justify-center h-full"
      data-aos={imageAlignment === 'right' ? 'fade-right' : 'fade-left'}
    >
      <h2 className={`text-4xl md:text-5xl font-serif italic mb-8 ${titleColor}`}>
        {title}
      </h2>

      <div className="prose prose-lg max-w-none relative">
        <div
          className={`text-lg leading-relaxed prose-p:mb-4 ${textColor} ${showSeeMoreButton && !isExpanded ? 'line-clamp-[8]' : ''} break-words whitespace-pre-wrap [&_*]:!bg-transparent [&_*]:!text-inherit`}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Gradient fade when collapsed */}
        {showSeeMoreButton && !isExpanded && (
          <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t to-transparent pointer-events-none ${gradientFrom}`}></div>
        )}
      </div>

      {showSeeMoreButton && (
        <div className="mt-8">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-2 font-medium px-6 py-3 rounded-full transition-all border ${bgVariant === 'dark'
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              : 'bg-[#1a3626]/10 hover:bg-[#1a3626]/20 text-[#1a3626] border-[#1a3626]/20'
              }`}
          >
            {isExpanded ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Read More <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const imageBlock = (
    <div
      className="relative h-[400px] lg:h-[550px] w-full overflow-hidden group bg-surface"
      data-aos={imageAlignment === 'right' ? 'fade-left' : 'fade-right'}
    >
      {displayImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${displayImage}')` }}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={64} className="text-gray-300" />
        </div>
      )}
    </div>
  );

  return (
    <section className={`${sectionBg} overflow-hidden`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center">

        {/* Mobile: image first. Desktop: based on imageAlignment */}
        <div className={`order-1 min-w-0 ${imageAlignment === 'right' ? 'lg:order-2' : 'lg:order-1'}`}>
          {imageBlock}
        </div>

        <div className={`order-2 min-w-0 ${imageAlignment === 'right' ? 'lg:order-1' : 'lg:order-2'} py-16 lg:py-24 px-6 sm:px-10 lg:px-16 xl:px-24`}>
          {contentBlock}
        </div>

      </div>
    </section>
  );
}
