import { Metadata } from "next";
import PublicationsExplorer from "./PublicationsExplorer";
import { PublicationItem, PublicationCategory } from "./types";

export const metadata: Metadata = {
  title: "Publications - Kawthoolei Forestry Department",
  description:
    "Official reports, press releases, and publications from the Kawthoolei Forestry Department.",
};

export const dynamic = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// The filter sidebar (category/organizer/language) and search need the full
// published set in the browser to filter instantly — this fetches a generous
// ceiling in one request rather than adding faceted-search endpoints.
const FETCH_CEILING = 200;

async function getCategories(): Promise<PublicationCategory[]> {
  try {
    const res = await fetch(`${API}/api/v1/public/publication-categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function getPublications(): Promise<PublicationItem[]> {
  const params = new URLSearchParams({ page: "0", size: String(FETCH_CEILING) });
  const res = await fetch(`${API}/api/v1/public/publications?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load publications: ${res.status}`);
  const json = await res.json();
  return json.data?.content ?? [];
}

export default async function PublicationsPage() {
  const [categories, publications] = await Promise.all([getCategories(), getPublications()]);

  return <PublicationsExplorer publications={publications} categories={categories} />;
}
