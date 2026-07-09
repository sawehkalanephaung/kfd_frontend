import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { getMediaUrl } from "@/lib/api";

export default function AboutChairmanSection({ chairmanData }: { chairmanData?: any }) {
  if (!chairmanData) {
    return (
      <section id="chairman" className="py-32 bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-ink mb-6">Chairman</h2>
          <p className="text-steel">Chairman details will be updated soon.</p>
        </div>
      </section>
    );
  }

  const chairman = chairmanData;
  const displayImage = chairman.image ? getMediaUrl(chairman.image) : null;

  return (
    <section id="chairman" className="py-32 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-ink mb-16">Chairman</h2>
        
        <div className="bg-canvas rounded-2xl shadow-sm border border-hairline overflow-hidden max-w-5xl">
          <div className="flex flex-col md:flex-row">
            {/* Portrait */}
            <div className="w-full md:w-2/5 lg:w-1/3 h-80 md:h-auto shrink-0 relative bg-surface flex items-center justify-center">
              {displayImage ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${displayImage}')` }}
                ></div>
              ) : (
                <User size={64} className="text-gray-300" />
              )}
            </div>

            {/* Bio Content */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center w-full min-w-0">
              <h3 className="text-3xl font-bold text-ink mb-6">{chairman.name}</h3>
              {chairman.bio && (
                <div 
                  className="text-steel mb-8 text-lg leading-relaxed line-clamp-4 prose prose-green max-w-none break-words overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: chairman.bio }}
                />
              )}
              {chairman.id && (
                <Link 
                  href={`/team/${chairman.id}`} 
                  className="inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-[#1a3626] hover:text-brand-green-dark transition-colors group w-fit"
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
