import { Metadata } from "next";
import { notFound } from "next/navigation";
import DepartmentHero from "../../_components/departments/DepartmentHero";
import DepartmentTabs from "../../_components/departments/DepartmentTabs";

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

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      <DepartmentHero data={departmentData} />
      <DepartmentTabs data={departmentData} />
    </main>
  );
}
