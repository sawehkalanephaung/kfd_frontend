import Link from "next/link";
import { User, ChevronRight } from "lucide-react";
import { getMediaUrl } from "@/lib/api";
import { formatFullDate, formatTenureYears } from "@/lib/date-utils";
import { notFound } from "next/navigation";

/**
 * Returns null only when the member does not exist (404). Any other failure
 * throws so error.tsx renders a retry instead of a misleading "not found".
 */
async function getTeamMember(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const res = await fetch(`${baseUrl}/api/v1/public/team-members/${id}`, {
    cache: 'no-store'
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load team member "${id}": ${res.status}`);

  const data = await res.json();
  return data?.data || null;
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

function Breadcrumb({ name }: { name: string }) {
  return (
    <div className="border-b border-[#e1e5e8] bg-canvas">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 py-4 text-sm font-medium text-[#5c6c7a]">
          <Link href="/" className="transition-colors hover:text-brand-text">Home</Link>
          <ChevronRight size={14} className="text-[#a8b3bc]" />
          <Link href="/team" className="transition-colors hover:text-brand-text">Team</Link>
          <ChevronRight size={14} className="text-[#a8b3bc]" />
          <span className="text-brand-text">{name}</span>
        </div>
      </div>
    </div>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4ade80]">
        {label}
      </dt>
      <dd className="mt-1.5 text-[15px] font-semibold text-white">{value}</dd>
    </div>
  );
}

export default async function TeamMemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getTeamMember(id);

  if (!member) {
    notFound();
  }

  const imageUrl = member.headshotUrl || member.headshot_url || member.imageUrl || member.avatarUrl;
  const displayImage = imageUrl ? getMediaUrl(imageUrl) : null;
  const fullName = `${member.firstName || member.first_name || member.name || ''} ${member.lastName || member.last_name || ''}`.trim() || 'Team Member';
  const finalTitle = parseI18nField(member.title) || member.role || member.position || 'Team Member';
  const bio = parseI18nField(member.bio || member.description) || '';

  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb name={fullName} />

      <section className="relative overflow-hidden bg-[#0b1f14] pb-14 pt-14 lg:pb-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full bg-[#1a4a2e]/20 blur-[100px]" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10 text-center md:flex-row md:gap-14 md:text-left lg:gap-20">
            <div className="relative h-[340px] w-[280px] shrink-0 overflow-hidden rounded-t-full rounded-b-md bg-[#12271b] shadow-2xl shadow-black/40 ring-1 ring-white/[0.08] sm:h-[365px] sm:w-[300px] lg:h-[393px] lg:w-[323px]">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={`${fullName}, ${finalTitle}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User size={96} className="text-white/20" aria-hidden="true" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            <div className="min-w-0 text-white">
              <h1 className="font-serif text-5xl font-bold tracking-tight lg:text-6xl">
                {fullName}
              </h1>
              <p className="mt-3 text-xl text-[#9ca3af] lg:text-2xl">
                {finalTitle}
              </p>

              {member.termStartDate && (
                <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:justify-start">
                  <HeroFact label="First Appointed" value={formatFullDate(member.termStartDate)} />
                  <div className="hidden h-10 w-px bg-white/15 sm:block" aria-hidden="true" />
                  <HeroFact
                    label="Tenure Period"
                    value={formatTenureYears(member.termStartDate, member.termEndDate)}
                  />
                </dl>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-28 pt-24 lg:pb-36 lg:pt-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[840px]">
            <h2 className="text-3xl font-bold tracking-tight text-[#001e2b]">Biography</h2>
            <div className="mt-6 h-px w-full bg-[#e1e5e8]" />

            {bio ? (
              <div
                className="rich-text prose prose-slate mt-10 max-w-none text-[#3d4f5b] md:text-justify [&_*]:!bg-transparent [&_*]:!text-inherit"
                dangerouslySetInnerHTML={{ __html: bio }}
              />
            ) : (
              <p className="mt-10 italic text-[#5c6c7a]">
                Detailed biography is currently being updated.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
