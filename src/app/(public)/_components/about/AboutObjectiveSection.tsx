export default function AboutObjectiveSection({ objectiveData }: { objectiveData?: any }) {
  const defaultText = "Our core objective is to map 100% of Kawthoolei's critical habitats by 2030, halt illegal logging through robust enforcement, and secure land rights for indigenous communities across the region.";
  
  return (
    <section id="objective" className="relative py-32 bg-[#1a3626]">
      {/* Background Image with heavy overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&q=80')" }}
      >
        <div className="absolute inset-0 bg-[#1a3626] mix-blend-multiply"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 tracking-wide">Our Objective</h2>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-12 rounded-2xl">
            <p className="text-xl md:text-2xl text-green-50 leading-relaxed font-medium">
              {objectiveData?.text || defaultText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
