import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Quote, User, FileText, ArrowLeft } from "lucide-react";
import { getMediaUrl } from "@/lib/api";

export const metadata: Metadata = {
  title: "Chairman - Kawthoolei Forestry Department",
  description: "Message and biography of the Chairman of the Kawthoolei Forestry Department.",
};

async function getTeamMembers() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${baseUrl}/api/v1/public/team-members`, { 
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return null;
  }
}

function parseI18nField(val: any): string {
  if (!val) return "";
  if (typeof val === "object") return val.text || val.en || Object.values(val)[0] || "";
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (parsed.richText) {
        try {
          const inner = JSON.parse(parsed.richText);
          return inner.en || inner.text || Object.values(inner)[0] || parsed.richText;
        } catch(e) {
          return parsed.richText;
        }
      }
      return parsed.text || parsed.en || Object.values(parsed)[0] || val;
    } catch (e) {
      return val;
    }
  }
  return String(val);
}

export default async function ChairmanPage() {
  const teamMembers = await getTeamMembers();

  let chairman = null;
  if (teamMembers && teamMembers.length > 0) {
    chairman = teamMembers.find((m: any) => {
      const titleStr = parseI18nField(m.title);
      const roleStr = (titleStr || m.role || m.position || "").toLowerCase();
      return roleStr.includes("chairman") || roleStr.includes("director general");
    });
  }

  if (!chairman) {
    return (
      <main className="min-h-screen bg-white pt-20">
        <div className="bg-[#f8faf9] border-b border-gray-100 py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Link href="/" className="hover:text-[#1a3626] transition-colors">Home</Link>
              <ChevronRight size={14} />
              <Link href="/about" className="hover:text-[#1a3626] transition-colors">About Us</Link>
              <ChevronRight size={14} />
              <span className="text-[#1a3626]">Chairman</span>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chairman Details</h1>
          <p className="text-gray-500">Chairman details will be updated soon.</p>
        </div>
      </main>
    );
  }

  const data = chairman;
  const fullName = `${data.firstName || data.first_name || data.name || ''} ${data.lastName || data.last_name || ''}`.trim() || 'Chairman';
  
  let finalTitle = parseI18nField(data.title) || data.role || data.position || 'Chairman';
  const bio = parseI18nField(data.bio || data.description) || '';
  const rawImage = data.headshot_url || data.headshotUrl || data.imageUrl || data.avatarUrl;
  const displayImage = rawImage ? getMediaUrl(rawImage) : null;

  return (
    <main className="min-h-screen bg-white pt-20">
      
      {/* ── Breadcrumb & Navigation ──────────────────────────────────── */}
      <div className="bg-[#f8faf9] border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Link href="/" className="hover:text-[#1a3626] transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/about" className="hover:text-[#1a3626] transition-colors">About Us</Link>
            <ChevronRight size={14} />
            <span className="text-[#1a3626]">Chairman</span>
          </div>
        </div>
      </div>

      {/* ── Official Hero Section ───────────────────────────────────── */}
      <section className="relative bg-[#0f2318] pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Subtle background patterns */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-green-900/30 blur-3xl rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/about" className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-10 transition-colors text-sm font-semibold uppercase tracking-wider group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to About KFD
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            
            {/* Portrait Frame (Left) */}
            <div className="w-full lg:w-1/3 flex justify-center lg:justify-end shrink-0">
              <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-t-full rounded-b-xl overflow-hidden border-[6px] border-[#1a3626] shadow-2xl bg-gray-100 flex items-center justify-center">
                {displayImage ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${displayImage}')` }}
                  />
                ) : (
                  <User size={100} className="text-gray-300" />
                )}
                {/* Formal gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Title & Introduction (Right) */}
            <div className="w-full lg:w-2/3 text-center lg:text-left text-white">
              <div className="inline-block bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-green-300 uppercase mb-6">
                Kawthoolei Forestry Department
              </div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight drop-shadow-md">
                {fullName}
              </h1>
              <p className="text-xl md:text-2xl text-green-100 font-medium tracking-wide mb-8">
                {finalTitle}
              </p>
              
              <div className="w-16 h-1 bg-green-500 mx-auto lg:mx-0 mb-8 rounded-full"></div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Biography & Message Section ──────────────────────────────── */}
      <section className="py-20 lg:py-32 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Bio Content */}
            <div className="prose prose-lg md:prose-xl prose-green max-w-none text-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Biography</h2>
              
              {bio ? (
                <div 
                  className="whitespace-pre-wrap leading-loose"
                  dangerouslySetInnerHTML={{ __html: bio }}
                />
              ) : (
                <p className="italic text-gray-500">
                  Detailed biography is currently being updated.
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
