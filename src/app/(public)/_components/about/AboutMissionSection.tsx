import { Check } from "lucide-react";

export default function AboutMissionSection({ missionData }: { missionData?: any }) {
  const defaultText = "To sustainably manage the natural resources of Kawthoolei, ensuring ecological balance, protecting biodiversity, and fostering community prosperity for generations to come.";
  const defaultBullets = [
    "SUSTAINABLE MANAGEMENT",
    "ECOLOGICAL BALANCE",
    "BIODIVERSITY PROTECTION",
    "COMMUNITY PROSPERITY"
  ];

  const text = missionData?.text || defaultText;
  const bullets = missionData?.bullets || defaultBullets;

  return (
    <section id="mission" className="relative py-32 bg-[#f0f4f1] overflow-hidden">
      {/* Subtle Background Image overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-multiply"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80')" }}
      ></div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <h2 className="text-5xl font-serif text-[#1a3626] mb-8">Our Mission</h2>
          
          <div className="border-l-4 border-[#2a563c] pl-8 mb-12">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium">
              {text}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
            {bullets.map((bullet: string, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="text-[#2a563c] shrink-0" size={20} />
                <span className="font-bold text-sm tracking-widest text-gray-800 uppercase">{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
