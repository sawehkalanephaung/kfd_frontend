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
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { DepartmentData } from "./types";
import { getMediaUrl } from "@/lib/api";

export const metadata: Metadata = {
  title: "Departments - Kawthoolei Forestry Department",
  description:
    "Explore the specialized units and departments of the Kawthoolei Forestry Department, each dedicated to protecting and restoring our forests.",
};

// Always fetch fresh data (no cache)
export const dynamic = "force-dynamic";

async function getDepartments(): Promise<DepartmentData[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/public/departments`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

function getDeptMeta(slug: string): {
  icon: React.ElementType;
  color: string;
  bg: string;
  accent: string;
  description: string;
} {
  const color = "text-brand-green-dark";
  const bg = "bg-brand-green-soft";
  const accent = "bg-brand-green";

  if (slug.includes("survey") || slug.includes("documentation")) {
    return {
      icon: BookOpen, color, bg, accent,
      description:
        "Conducting comprehensive land surveys and documentation to map and preserve forest territories across Kawthoolei.",
    };
  }
  if (slug.includes("awareness") || slug.includes("training")) {
    return {
      icon: Users, color, bg, accent,
      description:
        "Building forest stewardship through community education, public awareness campaigns, and capacity-building training programs.",
    };
  }
  if (slug.includes("protection") || slug.includes("land")) {
    return {
      icon: Shield, color, bg, accent,
      description:
        "Safeguarding forest boundaries and land rights through active patrol, enforcement, and legal documentation efforts.",
    };
  }
  if (slug.includes("nursery") || slug.includes("restoration") || slug.includes("plantation")) {
    return {
      icon: Sprout, color, bg, accent,
      description:
        "Growing native seedlings and leading large-scale reforestation programs to restore degraded forest ecosystems.",
    };
  }
  if (slug.includes("project")) {
    return {
      icon: Briefcase, color, bg, accent,
      description:
        "Coordinating multi-stakeholder conservation projects, grants, and partnerships for sustainable forest management.",
    };
  }
  return {
    icon: TreePine, color, bg, accent,
    description: "A specialized unit within the Kawthoolei Forestry Department.",
  };
}

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <main className="min-h-screen bg-surface">
      {/* ── Hero Banner ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0f2318] py-20 md:py-28">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10 flex items-center justify-center overflow-hidden pointer-events-none"
        >
          <TreePine size={400} className="text-white/10" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2318]/80 to-[#0f2318]/95" />

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-brand-green-soft blur-3xl" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">


          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            Our Department Branches

          </h1>

          <p className="max-w-2xl mx-auto text-lg text-on-dark-muted/70 leading-relaxed">
            Each unit of the Kawthoolei Forestry Department plays a vital role in
            protecting, restoring, and sustaining our forests for future generations.
          </p>



        </div>
      </section>

      {/* ── Department Grid ──────────────────────────────── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {departments.length === 0 ? (
          /* Fallback when backend is offline */
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
              <TreePine size={28} className="text-muted" />
            </div>
            <h2 className="text-xl font-semibold text-slate mb-2">No departments found</h2>
            <p className="text-steel text-sm">
              Please ensure the backend server is running.
            </p>
          </div>
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
                        Unit {String(idx + 1).padStart(2, "0")}
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
                      {meta.description}
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
                      <span className="text-xs font-semibold text-[#1a3626] group-hover:text-green-700 transition-colors">
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
