import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutChairmanSection({ chairmanData }: { chairmanData?: any }) {
  const defaultChairman = {
    name: "Saw Ler Moo",
    title: "Director General",
    bio: "Saw Ler Moo has served as the Director General of the Kawthoolei Forest Department since 2010, bringing over three decades of field experience in tropical forest ecology and indigenous land rights advocacy.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80"
  };

  const chairman = chairmanData || defaultChairman;

  return (
    <section id="chairman" className="py-32 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">Chairman</h2>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-5xl">
          <div className="flex flex-col md:flex-row">
            {/* Portrait */}
            <div className="w-full md:w-2/5 lg:w-1/3 h-80 md:h-auto shrink-0 relative bg-gray-200">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${chairman.image}')` }}
              ></div>
            </div>

            {/* Bio Content */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center w-full">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">{chairman.name}</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                {chairman.bio}
              </p>
              <Link 
                href="/about/chairman" 
                className="inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-[#1a3626] hover:text-[#2a563c] transition-colors group w-fit"
              >
                Read Full Bio
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
