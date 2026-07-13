import { getMediaUrl } from "@/lib/api";
import { ImageIcon } from "lucide-react";

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
  
  return (
    <section className="relative w-full min-h-[600px] flex items-center bg-[#0d1f15] overflow-hidden">
      {/* Background Image */}
      {displayImage ? (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${displayImage}')` }}
        />
      ) : (
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20">
          <ImageIcon size={120} className="text-white" />
        </div>
      )}
      {/* Gradient Overlay for Left-Aligned Text */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex justify-start py-20">
        <div className="max-w-2xl" data-aos="fade-up">
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
