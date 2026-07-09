import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use - Kawthoolei Forestry Department",
  description: "Terms of Use of the Kawthoolei Forestry Department website.",
};

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
    return data?.data || data || null;
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error);
    return null;
  }
}

export default async function TermsOfUsePage() {
  const pageData = await getPageData("terms-of-use");

  return (
    <main className="min-h-screen bg-canvas pt-20">
      <div className="bg-[#f8faf9] border-b border-hairline py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-steel font-medium">
            <Link href="/" className="hover:text-teal-deep transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#1a3626]">Terms of Use</span>
          </div>
        </div>
      </div>
      
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Only show title if it's not already in the content */}
          {!pageData?.content?.includes("<h2>") && !pageData?.content?.includes("<h1>") && (
            <h1 className="text-4xl font-bold text-ink mb-8">{pageData?.title || "Terms of Use"}</h1>
          )}
          <div className="prose prose-lg prose-green max-w-none text-slate">
            {pageData?.content ? (
              <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
            ) : (
              <p>Terms of Use content is currently being updated.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
