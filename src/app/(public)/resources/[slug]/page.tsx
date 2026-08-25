import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import { Calendar, Building2, Globe2, HardDrive, Download, FileText, ExternalLink } from "lucide-react";
import { PublicationItem } from "../types";

const publicSans = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], weight: ["500", "600", "700"] });

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Data fetcher ───────────────────────────────────────────────

/**
 * Returns null when the publication genuinely does not exist (404), and throws on
 * any other failure so error.tsx can offer a retry — mirrors (public)/news/[slug].
 */
async function getPublication(slug: string): Promise<PublicationItem | null> {
  const res = await fetch(`${API}/api/v1/public/publications/${slug}`, { cache: "no-store" });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load publication "${slug}": ${res.status}`);

  const json = await res.json();
  return json.data || null;
}

// ── Metadata ───────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const publication = await getPublication(slug);
    if (!publication) return { title: "Publications - KFD" };
    return {
      title: `${publication.title} - KFD`,
      description: publication.summary || "",
    };
  } catch {
    return { title: "Publications - KFD" };
  }
}

// ── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(dateStr));
}

function formatFileSize(sizeKb: number | null) {
  if (!sizeKb || sizeKb <= 0) return null;
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb} KB`;
}

function getMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ── Page ───────────────────────────────────────────────────────

export default async function PublicationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const publication = await getPublication(slug);

  if (!publication) notFound();

  const fileSize = formatFileSize(publication.documentFileSizeKb);
  const tags = [publication.category?.name, publication.language, publication.referenceNo].filter(
    (v): v is string => !!v
  );

  return (
    <div className={`${publicSans.className} min-h-screen bg-[#eef1f5] text-[#1a2231]`}>
      {/* page banner */}
      <div className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(105deg,#0f1f3d 0%,#1c355f 62%,#254273 100%)" }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 1px,transparent 1px 64px)" }}
        />
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-10 pb-8 relative">
          <div className="text-xs font-semibold tracking-[.18em] uppercase text-[#8fa6cf] mb-3">Document Library</div>
          <h1 className={`${sourceSerif.className} m-0 font-bold text-[34px] tracking-tight`}>Publications</h1>
          <div className="mt-4 flex items-center gap-2 text-[13px] text-[#b7c5dd] flex-wrap">
            <Link href="/" className="text-[#b7c5dd] hover:text-white transition-colors">Home</Link>
            <span className="opacity-50">/</span>
            <Link href="/resources" className="text-[#b7c5dd] hover:text-white transition-colors">Publications</Link>
            <span className="opacity-50">/</span>
            <span className="text-white font-semibold">{publication.title}</span>
          </div>
        </div>
      </div>

      {/* main */}
      <main className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-11 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-10 lg:gap-13 items-start">

          {/* cover column */}
          <div className="lg:sticky lg:top-6">
            <div className="border border-[#d5dce7] rounded-[10px] overflow-hidden bg-white shadow-[0_10px_30px_-12px_rgba(15,31,61,.35)]">
              {publication.thumbnailUrl ? (
                <img
                  src={getMediaUrl(publication.thumbnailUrl)}
                  alt={`${publication.title} cover`}
                  className="block w-full aspect-[3/4] object-cover"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-[#f6f8fb] flex items-center justify-center">
                  <FileText size={56} className="text-[#c6d0df]" />
                </div>
              )}
            </div>
          </div>

          {/* detail column */}
          <div>
            <h2 className={`${sourceSerif.className} m-0 font-bold text-[32px] sm:text-[40px] leading-[1.12] tracking-[-.015em] text-[#101a2c] text-pretty`}>
              {publication.title}
            </h2>
            {publication.summary && (
              <p className="mt-3.5 text-[16.5px] leading-relaxed text-[#4a5568] max-w-[56ch] text-pretty">
                {publication.summary}
              </p>
            )}

            {/* metadata */}
            <div className="mt-7 border border-[#dde3ec] rounded-xl bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#eaeef4] text-xs font-bold tracking-[.12em] uppercase text-[#5a677d] bg-[#f6f8fb]">
                Document Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <MetaRow icon={<Calendar size={17} />} label="Published" value={formatDate(publication.publishedDate)} />
                <MetaRow icon={<Building2 size={17} />} label="Issuing Body" value={publication.issuedBy || "Not specified"} />
                <MetaRow icon={<Globe2 size={17} />} label="Language" value={publication.language || "Not specified"} />
                <MetaRow icon={<HardDrive size={17} />} label="File Size" value={fileSize || "Unknown"} />
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex gap-3 flex-wrap items-center">
              <a
                href={`${API}/api/v1/public/publications/${publication.slug}/download`}
                className="inline-flex items-center gap-2.5 h-12 px-5.5 rounded-lg font-bold text-[14.5px] text-white transition-colors"
                style={{ background: "#b91c2c", boxShadow: "0 6px 16px -8px rgba(185,28,44,.6)" }}
              >
                <Download size={16} /> Download PDF
                {fileSize && (
                  <span className="text-xs font-semibold text-[#f6d5d9] border-l border-white/30 pl-2.5">{fileSize}</span>
                )}
              </a>
              {publication.documentUrl && (
                <a
                  href={getMediaUrl(publication.documentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-5 rounded-lg font-bold text-[14.5px] text-[#1f3a63] bg-white border-[1.5px] border-[#c6d0df] hover:border-[#1f3a63] hover:bg-[#f6f8fb] transition-colors"
                >
                  Preview online <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* about */}
            <div className="mt-10">
              <h3 className="m-0 text-[13px] font-extrabold tracking-[.12em] uppercase text-[#1f3a63] pb-3 border-b-2 border-[#1f3a63] inline-block">
                About this Document
              </h3>
              <p className="mt-5 text-[15.5px] leading-[1.72] text-[#3f4a5c] max-w-[64ch] text-pretty">
                {publication.summary || "No summary has been provided for this document."}
              </p>
              {tags.length > 0 && (
                <div className="mt-5.5 flex gap-2.5 flex-wrap">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[13px] font-semibold text-[#1f3a63] bg-[#e7edf6] border border-[#d6dfec] px-3.5 py-[7px] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-5 border-b border-r border-[#f0f3f8] flex gap-3.5 items-start">
      <div className="w-[38px] h-[38px] flex-none rounded-lg bg-[#eef2f8] text-[#1f3a63] flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-bold tracking-[.09em] uppercase text-[#8290a6]">{label}</div>
        <div className="mt-1 text-[15.5px] font-semibold text-[#1a2231] truncate">{value}</div>
      </div>
    </div>
  );
}
