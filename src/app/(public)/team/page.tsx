import Link from "next/link";
import { User, ArrowRight } from "lucide-react";
import { getMediaUrl } from "@/lib/api";

/**
 * This page's whole purpose is the team roster, so a fetch failure throws
 * (→ `(public)/error.tsx` retry UI) instead of quietly rendering an empty
 * grid indistinguishable from "no Chairman added yet."
 */
async function getTeamMembers() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const res = await fetch(`${baseUrl}/api/v1/public/team-members`, {
    cache: 'no-store'
  });

  if (!res.ok) throw new Error(`Failed to load Chairman: ${res.status}`);
  const data = await res.json();
  return data?.data || [];
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

export default async function TeamDirectoryPage() {
  const members = await getTeamMembers();

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-teal-deep text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Our Chairman</h1>
          <p className="text-xl text-on-dark-muted max-w-2xl mx-auto">
            Meet the dedicated leadership and Chairmen of the Kawthoolei Forestry Department.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-24 bg-surface flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {members.length === 0 ? (
            <div className="text-center py-20 bg-canvas rounded-2xl shadow-sm border border-hairline">
              <h3 className="text-xl text-steel font-medium">Chairman will be updated soon.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {members.map((member: any) => {
                const imageUrl = member.headshotUrl || member.headshot_url || member.imageUrl;
                const displayImage = imageUrl ? getMediaUrl(imageUrl) : null;
                const name = `${member.firstName || ''} ${member.lastName || ''}`.trim();
                const position = parseI18nField(member.title) || member.role || 'Member';

                return (
                  <Link href={`/team/${member.id}`} key={member.id} className="group flex flex-col bg-canvas rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-hairline overflow-hidden transform ">
                    {/* Image */}
                    <div className="aspect-[4/5] bg-surface relative overflow-hidden">
                      {displayImage ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                          style={{ backgroundImage: `url('${displayImage}')` }}
                        ></div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-surface">
                          <User size={64} className="text-gray-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1 relative">
                      <h3 className="text-xl font-bold text-ink mb-1 group-hover:text-teal-deep transition-colors">{name}</h3>
                      <p className="text-[#2a563c] font-medium text-sm mb-4">{position}</p>

                      {member.departmentName && (
                        <p className="text-steel text-xs mb-4 uppercase tracking-wider">{member.departmentName}</p>
                      )}

                      <div className="mt-auto flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-muted group-hover:text-teal-deep transition-colors">
                        View Profile
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
