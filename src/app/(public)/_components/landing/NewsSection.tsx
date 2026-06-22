import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NewsSection() {
  const newsItems = [
    {
      category: "Announcement",
      date: "Aug 15, 2024",
      title: "KFD Launches New Community Forest Monitoring System Across 5 Districts",
      excerpt: "In a collaborative effort with local leaders, we have deployed a new mobile-based reporting tool to empower communities in safeguarding their forests.",
      image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80",
      link: "/news/1"
    },
    {
      category: "Report",
      date: "Aug 02, 2024",
      title: "Annual Deforestation Rates Drop by 14% in Protected Zones",
      excerpt: "This year's forest cover analysis indicates a substantial reduction in illegal logging activities within our most vulnerable zones.",
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80",
      link: "/news/2"
    },
    {
      category: "Wildlife",
      date: "Jul 28, 2024",
      title: "2024 Biodiversity Assessment Confirms Increase in Tiger Population",
      excerpt: "Recent camera trap surveys conducted by KFD conservationists reveal a promising rise in the region's tiger numbers.",
      image: "https://images.unsplash.com/photo-1549480017-d5636ef4456f?auto=format&fit=crop&q=80",
      link: "/news/3"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">News & Announcements</h2>
          <Link 
            href="/news" 
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors group"
          >
            View All News 
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((news, index) => (
            <div key={index} className="flex flex-col group">
              {/* Image */}
              <div className="relative w-full h-56 rounded-xl overflow-hidden mb-5">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${news.image}')` }}
                />
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2a563c] bg-green-50 px-2.5 py-1 rounded-sm">
                  {news.category}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {news.date}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#2a563c] transition-colors">
                {news.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow">
                {news.excerpt}
              </p>

              {/* Link */}
              <Link 
                href={news.link}
                className="text-sm font-semibold text-[#1a3626] hover:text-green-700 flex items-center gap-1 mt-auto w-fit transition-colors"
              >
                Read More
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
