import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RESERVED_PAGE_SLUGS } from "@/lib/reserved-pages";

export const metadata: Metadata = {
  title: "Privacy Policy - Kawthoolei Forestry Department",
  description: "Privacy Policy of the Kawthoolei Forestry Department.",
};

/**
 * Sole content of this page — a real failure throws so error.tsx offers a
 * retry. A 404 means the page just hasn't been created yet (or was
 * deleted) — that's not a backend failure, so it degrades to null like any
 * other "not configured" case instead of hard-erroring the route.
 */
async function getPageData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const res = await fetch(`${baseUrl}/api/v1/public/pages/${slug}`, {
    next: { revalidate: 3600 }
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load page "${slug}": ${res.status}`);
  const data = await res.json();
  return data?.data || data || null; // fallback to data if not wrapped
}

export default async function PrivacyPolicyPage() {
  const pageData = await getPageData(RESERVED_PAGE_SLUGS.PRIVACY_POLICY);

  return (
    <main className="min-h-screen bg-canvas pt-20">
      <div className="bg-canvas border-b border-hairline py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-steel font-medium">
            <Link href="/" className="hover:text-teal-deep transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-brand-text">Privacy Policy</span>
          </div>
        </div>
      </div>
      
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Only show title if it's not already in the content */}
          {!pageData?.content?.includes("<h2>") && !pageData?.content?.includes("<h1>") && (
            <h1 className="text-4xl font-bold text-ink mb-8">{pageData?.title || "Privacy Policy"}</h1>
          )}
          <div className="prose prose-lg prose-green max-w-none text-slate">
            {pageData?.content ? (
              <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
            ) : (
              <p>Privacy Policy content is currently being updated.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
