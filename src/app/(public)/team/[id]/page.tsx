import Link from "next/link";
import { User, ChevronLeft, Building2 } from "lucide-react";
import { getMediaUrl } from "@/lib/api";
import { notFound } from "next/navigation";

async function getTeamMember(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${baseUrl}/api/v1/public/team-members/${id}`, { 
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error(`Error fetching team member ${id}:`, error);
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

export default async function TeamMemberProfilePage({ params }: { params: { id: string } }) {
  const member = await getTeamMember(params.id);

  if (!member) {
    notFound();
  }

  const imageUrl = member.headshotUrl || member.headshot_url || member.imageUrl;
  const displayImage = imageUrl ? getMediaUrl(imageUrl) : null;
  const name = `${member.firstName || ''} ${member.lastName || ''}`.trim();
  const position = parseI18nField(member.title) || member.role || 'Team Member';
  const bio = parseI18nField(member.bio || member.description);

  return (
    <main className="flex flex-col min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/team" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1a3626] transition-colors font-medium text-sm">
            <ChevronLeft size={16} />
            Back to Team Directory
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Portrait Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 relative bg-gray-100 aspect-[3/4] md:aspect-auto md:min-h-[500px]">
              {displayImage ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${displayImage}')` }}
                ></div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <User size={80} className="text-gray-300" />
                </div>
              )}
            </div>

            {/* Profile Content */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{name}</h1>
              <p className="text-xl text-[#2a563c] font-medium mb-8">{position}</p>
              
              {member.departmentName && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg w-fit border border-gray-100 mb-10">
                  <Building2 size={18} className="text-gray-400" />
                  <span className="font-medium text-sm tracking-wide uppercase">{member.departmentName}</span>
                </div>
              )}

              {/* Bio */}
              <div className="prose prose-lg prose-green max-w-none text-gray-600">
                {bio ? (
                  <div dangerouslySetInnerHTML={{ __html: bio }} />
                ) : (
                  <p className="italic">No biography information available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
