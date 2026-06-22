import Link from "next/link";
import { ArrowRight, Trees, PawPrint, Users, Scale } from "lucide-react";

export default function MissionSection() {
  const cards = [
    {
      title: "Forest Restoration",
      description: "Replanting and rehabilitating degraded forest areas for ecological recovery.",
      icon: <Trees size={20} className="text-[#2a563c]" />
    },
    {
      title: "Wildlife Protection",
      description: "Safeguarding endangered species and preserving critical habitats.",
      icon: <PawPrint size={20} className="text-[#2a563c]" />
    },
    {
      title: "Community Forestry",
      description: "Empowering local communities to manage and benefit from forest resources sustainably.",
      icon: <Users size={20} className="text-[#2a563c]" />
    },
    {
      title: "Policy & Law",
      description: "Formulating and enforcing environmental laws to combat illegal activities.",
      icon: <Scale size={20} className="text-[#2a563c]" />
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Text Block */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Building Nature's Future Through Governance & Science
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The Kawthoolei Forest Department stands at the forefront of environmental conservation in our region. 
                We are dedicated to the sustainable management and protection of our rich forest ecosystems, ensuring they 
                continue to thrive for generations to come.
              </p>
              <p>
                Working hand-in-hand with local communities, we implement science-based conservation strategies, 
                enforce forestry laws, and promote sustainable practices.
              </p>
              <p>
                Our approach integrates indigenous knowledge with modern ecological science to create a resilient 
                and harmonious environment for both nature and people.
              </p>
            </div>
            <div className="pt-4">
              <Link 
                href="/impact" 
                className="inline-flex items-center gap-2 bg-[#2a563c] hover:bg-[#326949] text-white font-medium px-6 py-3 rounded-md transition-colors"
              >
                Discover Our Impact
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Right Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map((card, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-100 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-green-50 rounded-md flex items-center justify-center mb-6">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
