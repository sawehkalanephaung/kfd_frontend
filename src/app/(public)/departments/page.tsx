import { Metadata } from "next";
import Link from "next/link";
import {
  TreePine,
  BookOpen,
  Shield,
  Sprout,
  Briefcase,
  ArrowRight,
  Users,
  FileText,
  Activity,
} from "lucide-react";
import { DepartmentData } from "./types";
import { getMediaUrl } from "@/lib/api";
import { extractPlainExcerpt } from "@/lib/rich-text";
import { ContentFallback } from "@/components/content-fallback";

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

/** Purely visual theming (icon/color) by slug — not content, safe to keep static. */
function getDeptMeta(slug: string): {
  icon: React.ElementType;
  color: string;
  bg: string;
  accent: string;
} {
  const color = "text-brand-green-dark";
  const bg = "bg-brand-green-soft";
  const accent = "bg-brand-green";

  if (slug.includes("survey") || slug.includes("documentation")) return { icon: BookOpen, color, bg, accent };
  if (slug.includes("awareness") || slug.includes("training")) return { icon: Users, color, bg, accent };
  if (slug.includes("protection") || slug.includes("land")) return { icon: Shield, color, bg, accent };
  if (slug.includes("nursery") || slug.includes("restoration") || slug.includes("plantation")) return { icon: Sprout, color, bg, accent };
  if (slug.includes("project")) return { icon: Briefcase, color, bg, accent };
  return { icon: TreePine, color, bg, accent };
}

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <main className="min-h-screen bg-surface">
      {/* ── Hero Banner ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest-800 py-20 md:py-28">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10 flex items-center justify-center overflow-hidden pointer-events-none"
        >
          <TreePine size={400} className="text-white/10" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-forest-800/80 to-forest-800/95" />

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-brand-green-soft blur-3xl" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">


          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            Our Department Branches

          </h1>

          <p className="max-w-2xl mx-auto text-lg text-on-dark-muted/70 leading-relaxed">
            Each branch of the Kawthoolei Forestry Department plays a vital role in
            protecting, restoring, and sustaining our forests for future generations.
          </p>



        </div>
      </section>

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {departments.map((dept, idx) => {
              const meta = getDeptMeta(dept.slug);
              const Icon = meta.icon;
              const headName = dept.headMember
                ? `${dept.headMember.firstName} ${dept.headMember.lastName}`
                : null;

              return (
                <Link
                  key={dept.id}
                  href={`/departments/${dept.slug}`}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-canvas border border-hairline shadow-sm hover:shadow-xl .5 transition-all duration-300"
                >
                  {/* Card Image */}
                  <div className={`relative h-48 overflow-hidden flex items-center justify-center ${meta.bg}`}>
                    {dept.heroImageUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${getMediaUrl(dept.heroImageUrl)}')` }}
                      />
                    ) : (
                      <Icon size={80} className={`${meta.color} opacity-20`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Order badge */}
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-bold text-white/80 bg-canvas/10 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full">
                        Branch {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Icon bubble */}
                    <div className="absolute bottom-4 left-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${meta.bg} ${meta.color} flex items-center justify-center shadow-lg border border-white/40`}
                      >
                        <Icon size={22} />
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-1 p-6">
                    <h2 className="text-base font-bold text-ink mb-3 group-hover:text-teal-deep transition-colors leading-snug line-clamp-2">
                      {dept.name}
                    </h2>

                    <p className="text-sm text-steel leading-relaxed mb-5 line-clamp-3 flex-1">
                      {extractPlainExcerpt(dept.bodyContent) || "A specialized unit within the Kawthoolei Forestry Department."}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-steel">
                      {headName && (
                        <span className="flex items-center gap-1.5 bg-surface border border-hairline px-2.5 py-1 rounded-full">
                          <Users size={11} className="text-muted" />
                          {headName}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 bg-surface border border-hairline px-2.5 py-1 rounded-full">
                        <FileText size={11} className="text-muted" />
                        {dept.resources?.length ?? 0} Resources
                      </span>
                      <span className="flex items-center gap-1.5 bg-surface border border-hairline px-2.5 py-1 rounded-full">
                        <Activity size={11} className="text-muted" />
                        {dept.posts?.length ?? 0} Activities
                      </span>
                    </div>

                    {/* CTA */}
                    <div
                      className={`flex items-center justify-between pt-4 border-t border-hairline`}
                    >
                      <span className="text-xs font-semibold text-forest group-hover:text-green-700 transition-colors">
                        View Department
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full ${meta.accent} text-white flex items-center justify-center transform transition-transform group-hover:translate-x-1`}
                      >
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </div>

                  {/* Hover accent bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${meta.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>


    </main>
  );
}
