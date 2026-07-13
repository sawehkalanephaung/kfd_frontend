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
    <section id="chairman" className="py-24 bg-canvas" data-aos="fade-up">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-surface rounded-2xl shadow-lg border border-hairline overflow-hidden max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row">
            {/* Portrait */}
            <div className="w-full md:w-2/5 lg:w-1/3 h-80 md:h-auto shrink-0 relative bg-[#0d1f15] flex items-center justify-center overflow-hidden">
              {displayImage ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${displayImage}')` }}
                ></div>
              ) : (
                <User size={64} className="text-white/30" />
              )}
            </div>

            {/* Bio Content */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center w-full min-w-0">
              <h3 className="text-3xl font-serif italic text-ink mb-2">{chairman.name}</h3>
              {chairman.title && (
                <p className="text-sm font-semibold text-brand-green-dark uppercase tracking-wider mb-6">
                  {chairman.title}
                </p>
              )}
              {chairman.bio && (
                <div 
                  className="text-steel mb-8 text-base leading-relaxed line-clamp-5 prose prose-green max-w-none break-words whitespace-pre-wrap overflow-hidden [&_*]:!bg-transparent [&_*]:!text-inherit"
                  dangerouslySetInnerHTML={{ __html: toSentenceCaseHTML(chairman.bio) }}
                />
              )}
              {chairman.id && (
                <Link 
                  href={`/team/${chairman.id}`} 
                  className="inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-[#1a3626] hover:text-brand-green-dark transition-colors group w-fit border border-[#1a3626]/20 px-6 py-3 rounded-full hover:bg-[#1a3626]/5"
                >
                  Read Full Bio
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
