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
        } catch (e) {
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

export default async function TeamMemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getTeamMember(id);

  if (!member) {
    notFound();
  }

  const imageUrl = member.headshotUrl || member.headshot_url || member.imageUrl;
  const displayImage = imageUrl ? getMediaUrl(imageUrl) : null;
  const name = `${member.firstName || ''} ${member.lastName || ''}`.trim();
  const position = parseI18nField(member.title) || member.role || 'Team Member';
  const bio = parseI18nField(member.bio || member.description);

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-32 pb-24 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <div className="mb-12">
          <Link href="/team" className="inline-flex items-center gap-2 text-muted hover:text-ink transition-colors font-medium text-sm">
            <ChevronLeft size={16} />
            Back to Team Directory
          </Link>
        </div>

        {/* Profile Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-[#111827] uppercase tracking-tight mb-4 font-sans">
            {name}
          </h1>
          <p className="text-xl md:text-2xl text-steel font-light">
            {position}
          </p>
        </div>

        {/* Circular Avatar */}
        <div className="flex justify-center mb-8">
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-200 relative">
            {displayImage ? (
              <img src={displayImage} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-surface">
                <User size={80} className="text-gray-300" />
              </div>
            )}
          </div>
        </div>



        {/* Department Badge (Optional) */}
        {/* {member.departmentName && (
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-2 text-steel bg-canvas px-5 py-2.5 rounded-full shadow-sm border border-hairline">
              <Building2 size={16} className="text-muted" />
              <span className="font-medium text-sm tracking-wide uppercase">{member.departmentName}</span>
            </div>
          </div>
        )} */}

        {/* Bio Content */}
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-0">
          <div className="prose prose-lg prose-gray text-steel leading-relaxed font-light w-full break-words [&_*]:!whitespace-normal [&_*]:!break-words [&_*]:max-w-full">
            {bio ? (
              <div dangerouslySetInnerHTML={{ __html: bio }} />
            ) : (
              <p className="text-center italic text-muted">No biography information available.</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
