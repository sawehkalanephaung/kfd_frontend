import { User } from "lucide-react";
import { getMediaUrl } from "@/lib/api";
import { PageHero } from "@/components/ui/page-hero";
import { Card, type CardMetaItem } from "@/components/ui/card";

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
      <PageHero
        title="Our Chairman"
        subtitle="Meet the dedicated leadership and Chairmen."
      />

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
                const meta: CardMetaItem[] | undefined = member.departmentName
                  ? [{ label: member.departmentName }]
                  : undefined;

                return (
                  <Card
                    key={member.id}
                    href={`/team/${member.id}`}
                    imageUrl={displayImage}
                    imageAlt={name}
                    imageAspect="portrait"
                    fallbackIcon={User}
                    title={name}
                    description={position}
                    meta={meta}
                    metaStyle="inline"
                    footerLabel="View Profile"
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
