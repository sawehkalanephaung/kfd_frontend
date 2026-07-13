import AboutContentSection from "../_components/about/AboutContentSection";
import AboutChairmanSection from "../_components/about/AboutChairmanSection";
import AboutHeroSection from "../_components/about/AboutHeroSection";

// Helper function to fetch page data from backend
async function getPageData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${baseUrl}/api/v1/public/pages/${slug}`, { 
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error);
    return null;
  }
}

// Helper function to fetch team members from backend
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
    getPageData("about-us"),
    getPageData("history"),
    getPageData("mission"),
    getPageData("vision"),
    getPageData("objective"),
    getTeamMembers()
  ]);

  // Removed parseContent as we now expect plain text


  // Extract Chairman from Team Members
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
    image: chairman.headshot_url || chairman.headshotUrl || chairman.imageUrl || chairman.avatarUrl || null
  } : undefined;

  return (
    <main className="flex flex-col min-h-screen">
      {/* Section 1: KFD Overview — Hero layout */}
      <AboutHeroSection 
        title={heroData?.title}
        tagline={heroData?.content}
        bgImage={heroData?.heroImageUrl || heroData?.sliderImageUrls?.[0]}
      />
      
      {/* Section 2: Our Mission — Split layout, image LEFT */}
      <AboutContentSection 
        title={missionData?.title || "Our Mission"} 
        content={missionData?.content || "Information about our mission will be updated soon."} 
        imageUrl={missionData?.heroImageUrl || missionData?.sliderImageUrls?.[0] || "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1600"}
        variant="split"
        bgVariant="light"
        imageAlignment="left"
      />
      
      {/* Section 3: Our Vision — Full-bleed background image, text RIGHT */}
      <AboutContentSection 
        title={visionData?.title || "Our Vision"} 
        content={visionData?.content || "As stewards of the Karen State's natural heritage, our vision is to cultivate a thriving, sustainable forest ecosystem that empowers local communities, preserves biodiversity, and ensures a greener future for generations to come."} 
        imageUrl={visionData?.heroImageUrl || visionData?.sliderImageUrls?.[0] || "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1600"}
        variant="fullbleed"
        textAlignment="right"
      />
      
      {/* Section 4: KFD History — Full-bleed background image, text LEFT */}
      <AboutContentSection 
        title={historyData?.title || "KFD History"} 
        content={historyData?.content || "Information about our history will be updated soon."} 
        imageUrl={historyData?.heroImageUrl || historyData?.sliderImageUrls?.[0] || "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1600"}
        variant="split"
        bgVariant="light"
        imageAlignment="right"
        enableSeeMore={true}
      />
      
      {/* Section 5: KFD Objective — Full-bleed background image, text RIGHT */}
      <AboutContentSection 
        title={objectiveData?.title || "KFD Objective"} 
        content={objectiveData?.content || "Information about our objective will be updated soon."} 
        imageUrl={objectiveData?.heroImageUrl || objectiveData?.sliderImageUrls?.[0] || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1600"}
        variant="split"
        bgVariant="white"
        imageAlignment="left"
      />
      
      {/* Section 6: Chairman Card */}
      <AboutChairmanSection 
        chairmanData={formattedChairman} 
      />
    </main>
  );
}
