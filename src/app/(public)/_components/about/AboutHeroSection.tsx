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
  const displayImage = bgImage ? getMediaUrl(bgImage) : "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=1600";
  const sanitizedTagline = tagline ? tagline.replace(/&nbsp;/ig, ' ') : '';
  
  return (
    <section className="relative w-full min-h-[600px] flex items-center bg-[#0d1f15] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${displayImage}')` }}
      />
      {/* Gradient Overlay for Left-Aligned Text */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0d1f15]/80 via-[#0d1f15]/40 to-transparent" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex justify-start">
        <div className="max-w-2xl p-8 md:p-10 rounded-3xl bg-black/20 backdrop-blur-md border border-white/5 shadow-2xl" data-aos="fade-up">
          <h1 
            className="text-5xl md:text-6xl font-serif text-white leading-tight mb-6 drop-shadow-md"
            dangerouslySetInnerHTML={{ __html: title || "About Kawthoolei<br/>Forestry Department" }}
          />
          <div 
            className="text-lg md:text-xl text-white/90 leading-relaxed font-medium drop-shadow-md prose prose-invert prose-p:mb-0 max-w-none break-words whitespace-pre-wrap overflow-hidden [&_*]:!bg-transparent [&_*]:!text-inherit"
            dangerouslySetInnerHTML={{ __html: sanitizedTagline || "Safeguarding the interconnected webs of biodiversity and communities through conservation, enforcement, and community partnership." }}
          />
        </div>
      </div>
    </section>
  );
}
