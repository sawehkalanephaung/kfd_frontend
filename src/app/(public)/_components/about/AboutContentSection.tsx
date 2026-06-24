'use client';
import React, { useState } from 'react';
import { getMediaUrl } from '@/lib/api';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AboutContentSectionProps {
  title: string;
  content: string;
  bgVariant?: 'light' | 'dark' | 'white';
  imageUrl?: string;
  imageAlignment?: 'left' | 'right';
  enableSeeMore?: boolean;
}

export default function AboutContentSection({ 
  title, 
  content, 
  bgVariant = 'white',
  imageUrl,
  imageAlignment = 'right',
  enableSeeMore = false
}: AboutContentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Set background and text colors based on variant
  let bgClass = "bg-white text-gray-900";
  let titleClass = "text-[#1a3626]";
  let contentClass = "text-gray-700";

  if (bgVariant === 'light') {
    bgClass = "bg-[#f0f4f1] text-gray-900";
    titleClass = "text-[#1a3626]";
    contentClass = "text-gray-700";
  } else if (bgVariant === 'dark') {
    bgClass = "bg-[#1a3626] text-white";
    titleClass = "text-green-50";
    contentClass = "text-green-100/90";
  }

  // Fallback image if none provided
  const displayImage = imageUrl 
    ? getMediaUrl(imageUrl) 
    : "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80";

  const isLongContent = content.length > 500;
  const showSeeMoreButton = enableSeeMore && isLongContent;

  const contentBlock = (
    <div className={`flex flex-col justify-center h-full ${imageAlignment === 'right' ? 'lg:pr-12' : 'lg:pl-12'}`}>
      <h2 className={`text-4xl md:text-5xl font-serif mb-8 ${titleClass}`}>
        {title}
      </h2>
      
      <div className="prose prose-lg max-w-none relative">
        <p className={`text-lg md:text-xl leading-relaxed whitespace-pre-wrap transition-all duration-500 ease-in-out ${contentClass} ${showSeeMoreButton && !isExpanded ? 'line-clamp-[8]' : ''}`}>
          {content}
        </p>
        
        {/* Gradient fade when collapsed */}
        {showSeeMoreButton && !isExpanded && (
          <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t to-transparent pointer-events-none ${bgVariant === 'dark' ? 'from-[#1a3626]' : bgVariant === 'light' ? 'from-[#f0f4f1]' : 'from-white'}`}></div>
        )}
      </div>

      {showSeeMoreButton && (
        <div className="mt-8">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-2 font-medium px-6 py-3 rounded-full transition-all ${
              bgVariant === 'dark' 
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                : 'bg-[#1a3626]/10 hover:bg-[#1a3626]/20 text-[#1a3626]'
            }`}
          >
            {isExpanded ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>See More <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const imageBlock = (
    <div className="relative h-[400px] lg:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl group">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${displayImage}')` }}
      />
      {/* Subtle overlay to ensure the image looks premium and fits the brand */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-700" />
    </div>
  );

  return (
    <section className={`py-20 lg:py-32 ${bgClass} overflow-hidden`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Mobile order: Image always first, then content. Desktop order alternates */}
          <div className={`order-1 ${imageAlignment === 'right' ? 'lg:order-2' : 'lg:order-1'}`}>
            {imageBlock}
          </div>
          
          <div className={`order-2 ${imageAlignment === 'right' ? 'lg:order-1' : 'lg:order-2'}`}>
            {contentBlock}
          </div>

        </div>
      </div>
    </section>
  );
}
