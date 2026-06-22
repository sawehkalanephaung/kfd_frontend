export default function AboutVisionSection({ visionData }: { visionData?: any }) {
  const defaultText = "A future where thriving, protected forests coexist seamlessly with empowered, self-sustaining local communities.";
  
  return (
    <section id="vision" className="relative py-48 w-full flex items-center justify-end">
      {/* Background Image of Village/Huts as per design */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549480017-d5636ef4456f?auto=format&fit=crop&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/80"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
        <div className="max-w-xl text-right">
          <h2 className="text-5xl md:text-6xl font-serif text-white mb-6 drop-shadow-lg">Our Vision</h2>
          <div className="border-r-4 border-[#2a563c] pr-6">
            <p className="text-xl md:text-2xl text-green-50 leading-relaxed font-medium drop-shadow-md">
              {visionData?.text || defaultText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
