import AboutHeroSection from "../_components/about/AboutHeroSection";
import AboutHistorySection from "../_components/about/AboutHistorySection";
import AboutMissionSection from "../_components/about/AboutMissionSection";
import AboutVisionSection from "../_components/about/AboutVisionSection";
import AboutObjectiveSection from "../_components/about/AboutObjectiveSection";
import AboutChairmanSection from "../_components/about/AboutChairmanSection";

// Helper function to fetch page data from backend
async function getPageData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${baseUrl}/api/v1/public/pages/${slug}`, { 
      next: { revalidate: 3600 } 
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
      next: { revalidate: 3600 } 
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

  // Parse JSON content if available
  const parseContent = (pageData: any) => {
    if (!pageData?.content) return null;
    try {
      // Assuming content might be stored as JSON string in CMS
      return JSON.parse(pageData.content);
    } catch {
      // Fallback to returning plain text
      return { text: pageData.content };
    }
  };

  // Extract Chairman from Team Members
  // Looking for someone with role/title Chairman or Director General
  let chairman = null;
  if (teamMembers && teamMembers.length > 0) {
    chairman = teamMembers.find((m: any) => 
      m.role?.toLowerCase().includes("chairman") || 
      m.role?.toLowerCase().includes("director general")
    ) || teamMembers[0]; // fallback to first member
  }

  // Formatting backend chairman data to match component props if it exists
  const formattedChairman = chairman ? {
    name: `${chairman.firstName} ${chairman.lastName}`,
    title: chairman.role || chairman.position,
    bio: chairman.bio || chairman.description,
    image: chairman.imageUrl || chairman.avatarUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80"
  } : undefined;

  return (
    <main className="flex flex-col min-h-screen">
      <AboutHeroSection 
        tagline={heroData?.content} 
        bgImage={heroData?.heroImageUrl} 
      />
      
      <AboutHistorySection 
        historyData={parseContent(historyData)} 
      />
      
      <AboutMissionSection 
        missionData={parseContent(missionData)} 
      />
      
      <AboutVisionSection 
        visionData={parseContent(visionData)} 
      />
      
      <AboutObjectiveSection 
        objectiveData={parseContent(objectiveData)} 
      />
      
      <AboutChairmanSection 
        chairmanData={formattedChairman} 
      />
    </main>
  );
}
