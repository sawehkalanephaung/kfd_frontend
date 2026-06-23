import Link from "next/link";

export default function HeroSection({ siteIdentity }: { siteIdentity: any }) {
  const title = siteIdentity?.organizationName || "Protecting Kawthoolei's Forests for Future Generations";
  const description = siteIdentity?.tagline || "The Kawthoolei Forest Department safeguards the interconnected webs of biodiversity and communities through conservation, enforcement, and community partnership.";

  return (
    <section className="relative w-full h-[600px] flex items-center">
      {/* Background with placeholder image and gradient overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a2e1d]/90 via-[#1a2e1d]/70 to-transparent"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {title}
          </h1>
          
          <p className="text-lg text-green-50 mb-10 max-w-xl leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/projects" 
              className="bg-[#2a563c] hover:bg-[#326949] text-white font-medium px-8 py-3.5 rounded-md transition-colors"
            >
              Explore Our Work
            </Link>
            <Link 
              href="/about" 
              className="bg-transparent border border-white text-white hover:bg-white/10 font-medium px-8 py-3.5 rounded-md transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel dots placeholder */}
      <div className="absolute bottom-8 right-8 z-10 flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
      </div>
    </section>
  );
}
