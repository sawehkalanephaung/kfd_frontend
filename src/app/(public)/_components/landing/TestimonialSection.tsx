export default function TestimonialSection() {
  return (
    <section className="bg-[#1a3626] text-white py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left: Portrait */}
          <div className="w-48 h-56 lg:w-64 lg:h-72 shrink-0 rounded-lg overflow-hidden border-4 border-white/10 shadow-2xl">
            <div 
              className="w-full h-full bg-cover bg-center grayscale"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80')" }}
            />
          </div>

          {/* Center: Quote */}
          <div className="flex-grow max-w-3xl">
            <blockquote className="text-2xl lg:text-3xl font-medium leading-relaxed italic text-green-50 mb-8">
              "The forests of Kawthoolei are not merely trees — they are the lungs of our people, the sanctuary of our wildlife, and the foundation of our sovereignty. KFD exists to protect this heritage with science, law, and the full partnership of our communities."
            </blockquote>
            <div>
              <p className="font-bold text-lg tracking-wide">Saw Tha Nwe</p>
              <p className="text-sm text-green-300 font-medium mt-1">
                Secretary General, Karen National Union - Forest Department
              </p>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="w-full lg:w-48 shrink-0 flex flex-row lg:flex-col gap-6 lg:gap-8 justify-between lg:border-l lg:border-green-800/50 lg:pl-10">
            <div className="flex flex-col">
              <span className="text-3xl font-bold mb-1 text-white">15+</span>
              <span className="text-xs text-green-300 uppercase tracking-wider font-semibold">Years in Service</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold mb-1 text-white">3</span>
              <span className="text-xs text-green-300 uppercase tracking-wider font-semibold">Awards for Conservation</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold mb-1 text-white">42</span>
              <span className="text-xs text-green-300 uppercase tracking-wider font-semibold">Village Forest Areas (VFAs)</span>
            </div>
          </div>

        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-green-900/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-[#132a1c] rounded-full blur-3xl"></div>
    </section>
  );
}
