import { Metadata } from "next";
import { notFound } from "next/navigation";
import DepartmentHero from "../../_components/departments/DepartmentHero";
import DepartmentTabs from "../../_components/departments/DepartmentTabs";
import { Reveal } from "@/components/ui/reveal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Always fetch fresh data
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/public/departments/${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.data) {
        return {
          title: `${data.data.name} - KFD`,
          description: `Learn more about the ${data.data.name} at the Kawthoolei Forestry Department.`,
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch department metadata", error);
  }
  
  return {
    title: "Department - KFD",
    description: "Kawthoolei Forestry Department",
  };
}

export default async function DepartmentPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch failures and missing records are different problems and must not be
  // conflated: a network/server error is re-thrown so error.tsx can offer a retry,
  // while a genuinely absent department still renders the 404 page.
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/public/departments/${slug}`,
    { cache: "no-store" }
  );

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error(`Failed to load department "${slug}": ${res.status}`);
  }

  const json = await res.json();
  const departmentData = json.data;

  if (!departmentData) {
    notFound();
  }

  let enhancedDepartmentData = { ...departmentData };

  // Workaround: The backend DepartmentService currently only populates 'resources' with raw MediaAssets,
  // completely ignoring Publications that are assigned to this department. 
  // Since we cannot modify the backend Java code from this workspace, we fetch the publications here 
  // and merge them into the resources list so they show up on the frontend.
  try {
    const publicationsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/public/publications?size=500`,
      { cache: "no-store" }
    );
    if (publicationsRes.ok) {
      const pubJson = await publicationsRes.json();
      const allPublications = pubJson.data?.content || [];
      
      const departmentPublications = allPublications.filter(
        (p: any) => p.departmentId === departmentData.id
      );

      console.log(`[DEBUG] Found ${departmentPublications.length} publications for department ${departmentData.name}`);

      const mappedPublications = departmentPublications.map((p: any) => ({
        id: p.id,
        fileName: p.title,
        fileUrl: p.documentUrl || "",
        fileType: p.documentFileType || "application/pdf",
        fileSizeKb: p.documentFileSizeKb || 0,
        mediaCategory: p.category?.name || "Publications",
        language: p.language || "English",
        createdAt: p.publishedDate || p.createdAt
      }));

      enhancedDepartmentData = {
        ...departmentData,
        resources: [
          ...(departmentData.resources || []),
          ...mappedPublications
        ]
      };
      
      console.log(`[DEBUG] Merged resources:`, enhancedDepartmentData.resources.map((r: any) => r.fileName));
    } else {
       console.error(`[DEBUG] Failed to fetch publications, status: ${publicationsRes.status}`);
    }
  } catch (err) {
    console.error("Failed to fetch publications for department", err);
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      <Reveal onMount>
        <DepartmentHero data={enhancedDepartmentData} />
      </Reveal>
      <Reveal>
        <DepartmentTabs data={enhancedDepartmentData} />
      </Reveal>
    </main>
  );
}
