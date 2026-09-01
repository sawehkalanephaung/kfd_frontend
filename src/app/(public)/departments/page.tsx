import { Metadata } from "next";
import {
  TreePine,
  BookOpen,
  Shield,
  Sprout,
  Briefcase,
  Users,
  FileText,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { DepartmentData } from "./types";
import { getMediaUrl } from "@/lib/api";
import { extractPlainExcerpt } from "@/lib/rich-text";
import { ContentFallback } from "@/components/content-fallback";
import { PageHero } from "@/components/ui/page-hero";
import { Card, type CardMetaItem } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Departments - Kawthoolei Forestry Department",
  description:
    "Explore the specialized units and departments of the Kawthoolei Forestry Department, each dedicated to protecting and restoring our forests.",
};

// Always fetch fresh data (no cache)
export const dynamic = "force-dynamic";

/**
 * This page's whole purpose is the department list, so a fetch failure
 * throws (→ `(public)/error.tsx` retry UI) instead of quietly rendering an
 * empty grid that looks identical to "no departments configured."
 */
async function getDepartments(): Promise<DepartmentData[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/public/departments`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Failed to load departments: ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

/** Purely visual theming (icon) by slug — not content, safe to keep static. */
function getDeptIcon(slug: string): LucideIcon {
  if (slug.includes("survey") || slug.includes("documentation")) return BookOpen;
  if (slug.includes("awareness") || slug.includes("training")) return Users;
  if (slug.includes("protection") || slug.includes("land")) return Shield;
  if (slug.includes("nursery") || slug.includes("restoration") || slug.includes("plantation")) return Sprout;
  if (slug.includes("project")) return Briefcase;
  return TreePine;
}

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <main className="min-h-screen bg-surface">
      <Reveal onMount>
        <PageHero
          title="Our Department Branches"
          subtitle="Each branch of the Kawthoolei Forestry Department plays a vital role in protecting, restoring, and sustaining our forests for future generations."
          icon={TreePine}
        />
      </Reveal>

      {/* ── Department Grid ──────────────────────────────── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {departments.length === 0 ? (
          <ContentFallback
            variant="empty"
            icon={TreePine}
            title="No departments yet"
            message="Department branches will appear here once they're added."
          />
        ) : (
          <Reveal className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" stagger>
            {departments.map((dept, idx) => {
              const headName = dept.headMember
                ? `${dept.headMember.firstName} ${dept.headMember.lastName}`
                : null;
              const meta: CardMetaItem[] = [
                ...(headName ? [{ icon: Users, label: headName }] : []),
                { icon: FileText, label: `${dept.resources?.length ?? 0} Resources` },
                { icon: Activity, label: `${dept.posts?.length ?? 0} Activities` },
              ];

              return (
                <Card
                  key={dept.id}
                  href={`/departments/${dept.slug}`}
                  imageUrl={dept.heroImageUrl ? getMediaUrl(dept.heroImageUrl) : null}
                  imageAlt={dept.name}
                  fallbackIcon={getDeptIcon(dept.slug)}
                  badge={`Branch ${String(idx + 1).padStart(2, "0")}`}
                  title={dept.name}
                  titleAs="h2"
                  description={extractPlainExcerpt(dept.bodyContent) || "A specialized unit within the Kawthoolei Forestry Department."}
                  meta={meta}
                  footerLabel="View Department"
                />
              );
            })}
          </Reveal>
        )}
      </section>


    </main>
  );
}
