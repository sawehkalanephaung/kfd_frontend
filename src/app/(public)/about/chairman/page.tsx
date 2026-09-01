import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import { getMediaUrl } from "@/lib/api";
import { formatFullDate, formatTenureYears } from "@/lib/date-utils";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Chairman - Kawthoolei Forestry Department",
  description: "Message and biography of the Chairman of the Kawthoolei Forestry Department.",
};

/**
 * This is the page's only content fetch, so a real backend failure throws
 * (→ `(public)/error.tsx` retry UI) rather than silently rendering the
 * "will be updated soon" copy meant for a genuinely-unset chairman.
 */
async function getTeamMembers() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const res = await fetch(`${baseUrl}/api/v1/public/team-members`, {
    cache: 'no-store'
  });

  if (!res.ok) throw new Error(`Failed to load Chairman: ${res.status}`);
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

/** Shared by the populated page and the "not published yet" state so both sit
 *  under the same navigation. */
function Breadcrumb() {
  return (
    <div className="border-b border-[#e1e5e8] bg-canvas">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-4 text-sm font-medium text-[#5c6c7a]">
          <Link href="/" className="transition-colors hover:text-brand-text">Home</Link>
          <ChevronRight size={14} className="text-[#a8b3bc]" />
          <Link href="/about" className="transition-colors hover:text-brand-text">About Us</Link>
          <ChevronRight size={14} className="text-[#a8b3bc]" />
          <span className="text-brand-text">Chairman</span>
        </div>
      </div>
    </div>
  );
}

/** One "FIRST APPOINTED / March 15, 2021" pair in the hero. */
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

export default async function ChairmanPage() {
  const teamMembers = await getTeamMembers();

  let chairman = null;
  if (teamMembers && teamMembers.length > 0) {
    chairman = teamMembers.find((m: any) => m.isKfdChairman === true);
  }

  if (!chairman) {
    return (
      <main className="min-h-screen bg-white">
        <Breadcrumb />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-[#001e2b]">Chairman</h1>
          <p className="text-[#5c6c7a]">Chairman details will be updated soon.</p>
        </div>
      </main>
    );
  }

  const data = chairman;
  const fullName = `${data.firstName || data.first_name || data.name || ''} ${data.lastName || data.last_name || ''}`.trim() || 'Chairman';

  const finalTitle = parseI18nField(data.title) || data.role || data.position || 'Chairman';
  const bio = parseI18nField(data.bio || data.description) || '';
  const rawImage = data.headshot_url || data.headshotUrl || data.imageUrl || data.avatarUrl;
  const displayImage = rawImage ? getMediaUrl(rawImage) : null;

  /* Colours here are literals rather than theme tokens on purpose. The public
     site is a light-only design with no theme switch, but ThemeProvider still
     runs with `enableSystem`, so a visitor whose OS prefers dark gets `.dark`
     on <html> — which would flip `text-ink` to white against these hard-coded
     white bands and erase the copy. Pinning the palette keeps the page as
     designed for every visitor. */
  return (
    <main className="min-h-screen bg-white">

      <Breadcrumb />

      {/* ── Official Hero ─────────────────────────────────────────────
          Portrait and identity sit side by side on a deep forest band; the
          whole block stacks and centres below `md`. */}
      <Reveal as="section" onMount className="relative overflow-hidden bg-[#0b1f14] pb-14 pt-14 lg:pb-24">
        {/* Barely-there dot grid keeps the flat green from reading as a slab. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-150 w-150 rounded-full bg-[#1a4a2e]/20 blur-[100px]" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10 text-center md:flex-row md:gap-14 md:text-left lg:gap-20">

            {/* Portrait — arched top, the department's house shape for officials */}
            <div className="relative h-85 w-70 shrink-0 overflow-hidden rounded-t-full rounded-b-md bg-[#12271b] shadow-2xl shadow-black/40 ring-1 ring-white/8 sm:h-91.25 sm:w-75 lg:h-98.25 lg:w-80.75">
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
              {/* Grounds the portrait against the band instead of letting it float. */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Identity */}
            <div className="min-w-0 text-white">
              <h1 className="font-serif text-5xl font-bold tracking-tight lg:text-6xl">
                {fullName}
              </h1>
              <p className="mt-3 text-xl text-[#9ca3af] lg:text-2xl">
                {finalTitle}
              </p>

              {data.termStartDate && (
                <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:justify-start">
                  <HeroFact label="First Appointed" value={formatFullDate(data.termStartDate)} />
                  <div className="hidden h-10 w-px bg-white/15 sm:block" aria-hidden="true" />
                  <HeroFact
                    label="Tenure Period"
                    value={formatTenureYears(data.termStartDate, data.termEndDate)}
                  />
                </dl>
              )}
            </div>

          </div>
        </div>
      </Reveal>

      {/* ── Biography ─────────────────────────────────────────────────
          A single measured column — the reading width is deliberately
          narrower than the hero so long official text stays legible. */}
      <Reveal as="section" className="bg-white pb-28 pt-24 lg:pb-36 lg:pt-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-210">

            <h2 className="text-3xl font-bold tracking-tight text-[#001e2b]">Biography</h2>
            <div className="mt-6 h-px w-full bg-[#e1e5e8]" />

            {bio ? (
              /* `rich-text` contains admin-authored HTML (wide tables, long URLs);
                 the `!bg-transparent`/`!text-inherit` overrides drop the inline
                 colours the editor pastes in, which otherwise fight this page. */
              <div
                className="rich-text prose prose-slate mt-10 max-w-none text-[#3d4f5b] md:text-justify **:bg-transparent! **:text-inherit!"
                dangerouslySetInnerHTML={{ __html: bio }}
              />
            ) : (
              <p className="mt-10 italic text-[#5c6c7a]">
                Detailed biography is currently being updated.
              </p>
            )}

          </div>
        </div>
      </Reveal>

    </main>
  );
}
