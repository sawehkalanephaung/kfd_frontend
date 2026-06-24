import AboutContentSection from "../_components/about/AboutContentSection";
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

  // Removed parseContent as we now expect plain text


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
    <main className="flex flex-col min-h-screen pt-20">
      <AboutContentSection 
        title={heroData?.title || "About KFD"} 
        content={heroData?.content || "Information about KFD will be updated soon."} 
        imageUrl={heroData?.heroImageUrl || heroData?.sliderImageUrls?.[0]}
        bgVariant="white"
        imageAlignment="right"
      />
      
      <AboutContentSection 
        title={historyData?.title || "History"} 
        content={historyData?.content || "Information about our history will be updated soon."} 
        imageUrl={historyData?.heroImageUrl || historyData?.sliderImageUrls?.[0]}
        bgVariant="dark"
        imageAlignment="left"
        enableSeeMore={true}
      />
      
      <AboutContentSection 
        title={missionData?.title || "Our Mission"} 
        content={missionData?.content || "Information about our mission will be updated soon."} 
        imageUrl={missionData?.heroImageUrl || missionData?.sliderImageUrls?.[0]}
        bgVariant="light"
        imageAlignment="right"
      />
      
      <AboutContentSection 
        title={visionData?.title || "Our Vision"} 
        content={visionData?.content || "Information about our vision will be updated soon."} 
        imageUrl={visionData?.heroImageUrl || visionData?.sliderImageUrls?.[0]}
        bgVariant="white"
        imageAlignment="left"
      />
      
      <AboutContentSection 
        title={objectiveData?.title || "Our Objective"} 
        content={objectiveData?.content || "Information about our objective will be updated soon."} 
        imageUrl={objectiveData?.heroImageUrl || objectiveData?.sliderImageUrls?.[0]}
        bgVariant="dark"
        imageAlignment="right"
      />
      
      <AboutChairmanSection 
        chairmanData={formattedChairman} 
      />
    </main>
  );
}
