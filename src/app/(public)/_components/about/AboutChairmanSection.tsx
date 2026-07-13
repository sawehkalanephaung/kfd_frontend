import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { getMediaUrl } from "@/lib/api";

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
  // Override with placeholder to remove fashion model
  const displayImage = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600";

  return (
    <section id="chairman" className="py-20 lg:py-28 bg-[#fafafa]" data-aos="fade-up">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-5xl mx-auto items-center">
          {/* Portrait */}
          <div className="lg:col-span-4 w-full h-[400px] md:h-[500px] relative bg-[#e0e0e0]">
            {displayImage ? (
              <div 
                className="absolute inset-0 bg-cover bg-center grayscale contrast-125"
                style={{ backgroundImage: `url('${displayImage}')` }}
              ></div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <User size={64} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Bio Content */}
          <div className="lg:col-span-8 flex flex-col justify-center w-full min-w-0">
            <h3 className="text-3xl md:text-4xl font-serif text-[#111] mb-2">{chairman.name}</h3>
            {chairman.title && (
              <p className="text-xs md:text-sm font-bold text-[#e5a93d] uppercase tracking-wider mb-6">
                {chairman.title}
              </p>
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
                className="inline-flex items-center gap-2 font-bold px-6 py-3 transition-all border border-[#1a3626]/30 text-[#1a3626] hover:bg-[#1a3626]/5 text-sm uppercase tracking-wider w-fit"
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
