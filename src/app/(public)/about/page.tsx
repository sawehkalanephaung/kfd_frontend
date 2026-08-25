import AboutContentSection from "../_components/about/AboutContentSection";
import AboutChairmanSection from "../_components/about/AboutChairmanSection";
import AboutHeroSection from "../_components/about/AboutHeroSection";
import AboutMissionVisionSection from "../_components/about/AboutMissionVisionSection";
import { RESERVED_PAGE_SLUGS } from "@/lib/reserved-pages";

/**
 * `about-us` is this page's primary content (pass throwOnError: true) so a
 * real backend failure surfaces the site's `error.tsx` retry UI instead of
 * quietly rendering a blank hero. The other sections fetched with this same
 * helper (history/mission/vision/objective) are supplementary — they keep
 * degrading to their own existing "will be updated soon" copy.
 *
 * A 404 is deliberately NOT treated as a throwOnError failure: it means the
 * page genuinely doesn't exist yet (e.g. never created, or deleted by an
 * admin) — not that the backend is broken. Retrying wouldn't help, so it
 * degrades to null like any other "not configured yet" case, matching the
 * 404-vs-real-error split already used by departments/[slug]/page.tsx and
 * team/[id]/page.tsx.
 */
async function getPageData(slug: string, { throwOnError = false } = {}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${baseUrl}/api/v1/public/pages/${slug}`, {
      cache: 'no-store'
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      if (throwOnError) throw new Error(`Failed to load page "${slug}": ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    if (throwOnError) throw error;
    console.error(`Error fetching page ${slug}:`, error);
    return null;
  }
}

// Helper function to fetch  Chairman from backend
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
    console.error("Error fetching Chairman:", error);
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

export default async function AboutUsPage() {
  // Fetch data in parallel
  const [
    heroData,
    historyData,
    missionData,
    visionData,
    objectiveData,
    teamMembers
  ] = await Promise.all([
    getPageData(RESERVED_PAGE_SLUGS.ABOUT_US, { throwOnError: true }),
    getPageData(RESERVED_PAGE_SLUGS.HISTORY),
    getPageData(RESERVED_PAGE_SLUGS.MISSION),
    getPageData(RESERVED_PAGE_SLUGS.VISION),
    getPageData(RESERVED_PAGE_SLUGS.OBJECTIVE),
    getTeamMembers()
  ]);

  // Removed parseContent as we now expect plain text


  // Extract Chairman from Chairman
  let chairman = null;
  if (teamMembers && teamMembers.length > 0) {
    chairman = teamMembers.find((m: any) => m.isKfdChairman === true);
  }

  let finalTitle = 'Chairman';
  if (chairman) {
    finalTitle = parseI18nField(chairman.title) || chairman.role || chairman.position || 'Chairman';
  }

  const formattedChairman = chairman ? {
    id: chairman.id,
    name: `${chairman.firstName || chairman.first_name || chairman.name || ''} ${chairman.lastName || chairman.last_name || ''}`.trim() || 'Chairman',
    title: finalTitle,
    bio: parseI18nField(chairman.bio || chairman.description),
    image: chairman.headshot_url || chairman.headshotUrl || chairman.imageUrl || chairman.avatarUrl || null,
    termStartDate: chairman.termStartDate,
    termEndDate: chairman.termEndDate
  } : undefined;

  return (
    <main className="flex flex-col min-h-screen">
      {/* Section 1: KFD Overview — Hero layout */}
      <AboutHeroSection
        title={heroData?.title}
        tagline={heroData?.content}
        bgImage={heroData?.heroImageUrl || heroData?.sliderImageUrls?.[0]}
      />

      {/* Section 2: Mission & Vision Cards */}
      <AboutMissionVisionSection
        missionData={missionData}
        visionData={visionData}
      />

      {/* Section 3: KFD History — Dark variant */}
      <AboutContentSection
        title={historyData?.title || "KFD History"}
        content={historyData?.content || "Information about our history will be updated soon."}
        imageUrl={historyData?.heroImageUrl || historyData?.sliderImageUrls?.[0]}
        variant="split"
        bgVariant="dark"
        imageAlignment="right"
        buttonText="READ FULL HISTORY"
        buttonLink="/history"
      />

      {/* Section 4: KFD Objective — Text Only */}
      <AboutContentSection
        title={objectiveData?.title || "Our Objectives"}
        content={objectiveData?.content || "Information about our objective will be updated soon."}
        variant="text-only"
        bgVariant="light"
      />

      {/* Section 6: Chairman Card */}
      <AboutChairmanSection
        chairmanData={formattedChairman}
      />
    </main>
  );
}
