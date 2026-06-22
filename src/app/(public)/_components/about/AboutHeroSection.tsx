export default function AboutHeroSection({ tagline, bgImage }: { tagline?: string, bgImage?: string }) {
  const defaultBg = "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80";
  
  return (
    <section className="relative w-full h-[600px] flex items-center justify-center text-center">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage || defaultBg}')` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-6xl font-serif text-white tracking-widest mb-6 drop-shadow-lg">
          ABOUT KFD
        </h1>
        <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto leading-relaxed drop-shadow-md font-medium">
          {tagline || "We are dedicated to the sustainable management of Kawthoolei's natural resources. Our work bridges traditional ecological knowledge with modern conservation strategies to protect our land and empower our people."}
        </p>
      </div>
    </section>
  );
}
