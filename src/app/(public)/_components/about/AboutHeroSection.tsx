import { getMediaUrl } from "@/lib/api";
import { ImageIcon } from "lucide-react";

export default function AboutHeroSection({ tagline, bgImage }: { tagline?: string, bgImage?: string }) {
  
  return (
    <section className="relative w-full h-[600px] flex items-center justify-center text-center bg-[#0f2318]">
      {bgImage ? (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${getMediaUrl(bgImage)}')` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <ImageIcon size={64} className="text-white/5" />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      )}

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-6xl font-serif text-white tracking-widest mb-6 drop-shadow-lg">
          ABOUT KFD
        </h1>
        <p className="text-lg md:text-xl text-on-dark-muted max-w-3xl mx-auto leading-relaxed drop-shadow-md font-medium">
          {tagline || "We are dedicated to the sustainable management of Kawthoolei's natural resources. Our work bridges traditional ecological knowledge with modern conservation strategies to protect our land and empower our people."}
        </p>
      </div>
    </section>
  );
}
