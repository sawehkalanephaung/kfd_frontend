import type { LucideIcon } from 'lucide-react';

interface PageHeroProps {
  title: string;
  /** Rendered as plain text unless `titleHtml` is set - most callers pass a
   *  static string; AboutHeroSection needs admin-authored rich text. */
  titleHtml?: string;
  subtitle?: string;
  subtitleHtml?: string;
  /** Serif matches the "editorial" pages (History, Contact); sans (default)
   *  matches the "directory" pages (About, Departments, News, Team). Kept
   *  as a deliberate per-page choice rather than forced to one family. */
  titleFont?: 'sans' | 'serif';
  align?: 'center' | 'left';
  backLink?: { href: string; label: string };
  /** Resolved media URL for a dynamic, admin-uploaded background photo.
   *  Rendered as a decorative CSS background (not a semantic <img>) since
   *  it's purely atmospheric behind the heading, which already carries
   *  the page's meaning - see UI_ACCESSIBILITY_AUDIT's reasoning for
   *  HeroSection/AboutHeroSection/history's hero treatment. */
  imageUrl?: string | null;
  /** Small decorative watermark icon shown at low opacity (departments'
   *  TreePine motif). Purely cosmetic - omit for a plainer hero. */
  icon?: LucideIcon;
}

/**
 * Shared dark hero band for interior pages. Previously hand-built 8 times
 * (About, Departments, News list/Events/Announcements, Contact, History,
 * Team) with drifting backgrounds (bg-forest-800/-900/-950, bg-teal-deep,
 * three different raw hex values), fixed pixel heights that don't scale to
 * content (h-[400px], min-h-[600px]) instead of responsive padding, and a
 * mix of tokens vs hardcoded colors. This consolidates all of that onto
 * the --color-forest-950 base already used by three of the eight, with
 * responsive py-20 md:py-28 spacing (no fixed height) so it never crops or
 * cramps a longer admin-authored title. See UI_ACCESSIBILITY_AUDIT §3.
 */
export function PageHero({
  title,
  titleHtml,
  subtitle,
  subtitleHtml,
  titleFont = 'sans',
  align = 'center',
  backLink,
  imageUrl,
  icon: Icon,
}: PageHeroProps) {
  const isLeft = align === 'left';
  const titleFontClass = titleFont === 'serif' ? 'font-serif' : 'font-sans';

  return (
    <section className="relative w-full overflow-hidden bg-forest-950">
      {/* Background image (decorative) + legibility gradient */}
      {imageUrl ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${imageUrl}')` }}
            aria-hidden="true"
          />
          <div
            className={`absolute inset-0 ${
              isLeft
                ? 'bg-gradient-to-r from-black/80 via-black/40 to-transparent'
                : 'bg-black/60'
            }`}
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950 to-forest-900" aria-hidden="true" />
      )}

      {/* Decorative watermark icon */}
      {Icon && (
        <Icon
          className="absolute -right-8 -bottom-8 w-64 h-64 text-white/5 pointer-events-none"
          aria-hidden="true"
        />
      )}

      <div
        className={`relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col ${
          isLeft ? 'items-start text-left' : 'items-center text-center'
        }`}
      >
        <div className={isLeft ? 'max-w-2xl' : 'max-w-2xl mx-auto'}>
          {backLink && (
            <a
              href={backLink.href}
              className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-green-400 hover:text-brand-green transition-colors mb-6"
            >
              ← {backLink.label}
            </a>
          )}

          {titleHtml ? (
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold ${titleFontClass} text-white leading-tight tracking-tight mb-6 drop-shadow-md`}
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />
          ) : (
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${titleFontClass} text-white leading-tight tracking-tight mb-6 drop-shadow-md`}>
              {title}
            </h1>
          )}

          {subtitleHtml ? (
            <div
              className="text-base md:text-lg text-on-dark-muted leading-relaxed rich-text"
              dangerouslySetInnerHTML={{ __html: subtitleHtml }}
            />
          ) : subtitle ? (
            <p className="text-base md:text-lg text-on-dark-muted leading-relaxed">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
