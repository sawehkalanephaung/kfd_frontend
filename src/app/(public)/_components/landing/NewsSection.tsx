import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NewsSection({ news }: { news: any[] }) {
  const defaultNews = [
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

  const displayNews = news && news.length > 0 ? news : defaultNews;

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
          {displayNews.slice(0, 3).map((item, index) => {
            const dateStr = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : item.date;
            const catName = item.category?.name || item.category;
            const imgUrl = item.featuredImage || item.image || "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80";
            const itemLink = item.slug ? `/news/${item.slug}` : item.link;

            return (
              <div key={item.id || index} className="flex flex-col group h-full">
                {/* Image */}
                <div className="relative w-full h-56 rounded-xl overflow-hidden mb-5 shrink-0 bg-gray-100">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${imgUrl}')` }}
                  />
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#2a563c] bg-green-50 px-2.5 py-1 rounded-sm">
                    {catName}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {dateStr}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#2a563c] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow line-clamp-3">
                  {item.excerpt}
                </p>

                {/* Link */}
                <Link 
                  href={itemLink}
                  className="text-sm font-semibold text-[#1a3626] hover:text-green-700 flex items-center gap-1 mt-auto w-fit transition-colors"
                >
                  Read More
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
