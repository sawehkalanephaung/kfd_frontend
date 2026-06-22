export default function AboutHistorySection({ historyData }: { historyData?: any }) {
  const defaultHistory = [
    {
      year: "1984",
      title: "Foundation",
      description: "Established to counteract widespread illegal logging, the department began as a small coalition of community leaders and field biologists dedicated to mapping endangered territories."
    },
    {
      year: "2002",
      title: "The Canopy Act",
      description: "Implementation of our first comprehensive digital mapping initiative, integrating satellite imagery with on-the-ground indigenous patrols to create real-time threat assessments."
    },
    {
      year: "RECENT",
      title: "Modern Era",
      description: "Today, we operate a network of over 45 field stations, employing advanced ecological modeling while remaining fundamentally rooted in community-led governance."
    }
  ];

  const items = historyData?.length ? historyData : defaultHistory;

  return (
    <section id="history" className="py-24 bg-[#1a3626] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif mb-16 text-green-50">History</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Horizontal line for desktop */}
          <div className="hidden md:block absolute top-6 left-0 right-0 h-[1px] bg-green-800"></div>

          {items.map((item: any, index: number) => (
            <div key={index} className="relative z-10 pt-4 md:pt-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#2a563c] rounded-full flex items-center justify-center text-sm font-bold border-4 border-[#1a3626]">
                  {item.year || "•"}
                </div>
              </div>
              <h3 className="text-2xl font-serif mb-4">{item.title}</h3>
              <p className="text-sm text-green-100/80 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
