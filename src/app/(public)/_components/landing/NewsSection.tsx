import Link from "next/link";
import { ArrowRight, Bell, CalendarDays } from "lucide-react";

export default function NewsSection({ news, notices }: { news: any[], notices?: any[] }) {
  const defaultNews = [
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

  const defaultNoticeBoardItems = [
    {
      id: 1,
      type: "Announcement",
      title: "New Policy on Forest Access during Dry Season",
      date: "Sep 01, 2024",
      link: "/news/announcements"
    },
    {
      id: 2,
      type: "Event",
      title: "Annual Community Tree Planting Day",
      date: "Sep 15, 2024",
      link: "/news/events"
    },
    {
      id: 3,
      type: "Announcement",
      title: "Deadline for Regional Forestry Permits Extended",
      date: "Aug 28, 2024",
      link: "/news/announcements"
    }
  ];

  const displayNotices = notices && notices.length > 0 ? notices : defaultNoticeBoardItems;

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Latest News */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
              <Link 
                href="/news" 
                className="text-sm font-semibold text-gray-600 hover:text-[#1a3626] flex items-center gap-1 transition-colors group"
              >
                View All News 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {displayNews.slice(0, 2).map((item, index) => {
                const dateStr = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : item.date;
                const catName = item.category?.name || item.category;
                const imgUrl = item.featuredImage || item.image || "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80";
                const itemLink = item.slug ? `/news/${item.slug}` : item.link;

                return (
                  <div key={item.id || index} className="flex flex-col group h-full">
                    {/* Image */}
                    <div className="relative w-full h-52 rounded-xl overflow-hidden mb-5 shrink-0 bg-gray-100">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url('${imgUrl}')` }}
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2a563c] bg-green-50 px-2.5 py-1 rounded-sm">
                        {catName}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        {dateStr}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#2a563c] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow line-clamp-3 mb-4">
                      {item.excerpt}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Announcements & Events */}
          <div className="lg:col-span-1 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Announcements & Events</h2>
            
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col gap-6 flex-grow">
              {displayNotices.map((notice) => {
                const isReal = !!notice.category;
                const type = isReal ? notice.category.name : notice.type;
                const title = isReal ? notice.title : notice.title;
                const link = isReal ? `/news/${notice.slug}` : notice.link;
                
                // Use eventDate if it's an event, else publishedAt
                let dateStr = notice.date;
                if (isReal) {
                  const isEvent = notice.category?.slug?.toLowerCase() === 'event';
                  const dateObj = isEvent && notice.metadata?.eventDate 
                    ? new Date(notice.metadata.eventDate) 
                    : new Date(notice.publishedAt || notice.createdAt);
                  dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
                }

                return (
                  <Link 
                    key={notice.id} 
                    href={link}
                    className="group flex gap-4 p-4 -mx-4 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-green-50 group-hover:border-green-100 group-hover:text-[#2a563c] transition-colors text-gray-400">
                      {(type === "Event" || type?.toLowerCase() === "event") ? <CalendarDays size={18} /> : <Bell size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                          (type === "Event" || type?.toLowerCase() === "event") ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {type}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{dateStr}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#2a563c] transition-colors line-clamp-2">
                        {title}
                      </h4>
                    </div>
                  </Link>
                );
              })}

              <div className="mt-auto pt-4 border-t border-gray-200/60 flex justify-between">
                <Link href="/news/announcements" className="text-xs font-semibold text-[#2a563c] hover:underline">
                  All Announcements
                </Link>
                <Link href="/news/events" className="text-xs font-semibold text-[#2a563c] hover:underline">
                  All Events
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
