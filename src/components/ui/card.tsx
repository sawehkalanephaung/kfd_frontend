import Link from 'next/link';
import { ArrowRight, ImageIcon as ImageIconDefault, type LucideIcon } from 'lucide-react';

export interface CardMetaItem {
  icon?: LucideIcon;
  label: string;
}

interface CardProps {
  href: string;
  imageUrl?: string | null;
  imageAlt: string;
  title: string;
  titleAs?: 'h2' | 'h3' | 'h4';
  /** Excerpt (departments/news) or subtitle/role (team) - same slot, same styling. */
  description?: string;
  /** Small pill shown over the top-left of the image - an order number
   *  ("Branch 01") or a category name ("Announcement"). */
  badge?: string;
  /** Icon+label row: department stats (3 items, pill style) or a single
   *  date (news, plain-text style). Omit for team cards, which use
   *  `description` for the job title instead. */
  meta?: CardMetaItem[];
  metaStyle?: 'pills' | 'inline';
  /** Footer call-to-action text with a trailing arrow, e.g. "View Profile". */
  footerLabel?: string;
  /** 'dark' matches the dark-themed News pages; 'light' (default) matches
   *  Departments/Team's canvas-surface cards. */
  variant?: 'light' | 'dark';
  fallbackIcon?: LucideIcon;
  /** 'landscape' (default, h-48) fits department/news photography;
   *  'portrait' (aspect-[4/5]) fits team headshots without cropping them
   *  into an awkward wide frame. */
  imageAspect?: 'landscape' | 'portrait';
  /** Escape hatch for a caller-specific need (e.g. a GSAP scroll-animation
   *  target class) without growing Card's own prop surface for it. */
  className?: string;
}

/**
 * Shared grid card: image + optional badge + title + description/meta +
 * optional footer link. Previously rebuilt independently for the homepage
 * department teaser, the full department list, the homepage news teaser
 * (which had no <Link> wrapper at all - a real bug, the whole card was
 * unclickable dead UI), the news list grid, the article "related posts"
 * card, and the team directory - six near-identical shapes with drifting
 * radii (rounded-lg/rounded-xl/rounded-2xl), shadow scales, badge colors
 * (raw hex in two places), and hover treatments. This generalizes from
 * departments/page.tsx's card, which was the most complete of the six
 * (full-card Link, real <img>, token colors throughout, badge + excerpt +
 * metadata + multi-part hover feedback). See UI_ACCESSIBILITY_AUDIT §3.
 */
export function Card({
  href,
  imageUrl,
  imageAlt,
  title,
  titleAs = 'h3',
  description,
  badge,
  meta,
  metaStyle = 'pills',
  footerLabel,
  variant = 'light',
  fallbackIcon: FallbackIcon = ImageIconDefault,
  imageAspect = 'landscape',
  className = '',
}: CardProps) {
  const isDark = variant === 'dark';
  const Title = titleAs;

  return (
    <Link
      href={href}
      className={`group relative flex flex-col h-full overflow-hidden rounded-2xl border transition-all duration-300 ${className} ${
        isDark
          ? 'bg-forest-800 border-white/5 hover:border-brand-green-dark/40 shadow-sm hover:shadow-xl'
          : 'bg-canvas border-hairline shadow-sm hover:shadow-xl'
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden shrink-0 flex items-center justify-center ${
          imageAspect === 'portrait' ? 'aspect-[4/5]' : 'h-48'
        } ${isDark ? 'bg-forest-900' : 'bg-surface'}`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <FallbackIcon className={`w-12 h-12 ${isDark ? 'text-white/10' : 'text-muted'}`} aria-hidden="true" />
        )}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isDark
              ? 'bg-gradient-to-t from-forest-800/60 to-transparent'
              : 'bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100'
          }`}
          aria-hidden="true"
        />
        {badge && (
          <span
            className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
              isDark ? 'bg-canvas/10 text-white backdrop-blur-sm border border-white/20' : 'bg-canvas/90 text-forest backdrop-blur-sm shadow-sm'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <Title className={`font-bold mb-2 line-clamp-2 ${isDark ? 'text-white text-base' : 'text-ink text-lg'}`}>
          {title}
        </Title>

        {description && (
          <p className={`text-sm leading-relaxed line-clamp-3 flex-1 ${isDark ? 'text-white/60' : 'text-steel'}`}>
            {description}
          </p>
        )}

        {meta && meta.length > 0 && (
          <div className={`flex flex-wrap items-center gap-2 ${description ? 'mt-4' : 'mt-1'}`}>
            {meta.map((item, i) => {
              const MetaIcon = item.icon;
              if (metaStyle === 'inline') {
                return (
                  <span key={i} className={`inline-flex items-center gap-1.5 text-xs ${isDark ? 'text-white/50' : 'text-steel'}`}>
                    {MetaIcon && <MetaIcon className="w-3.5 h-3.5" aria-hidden="true" />}
                    {item.label}
                  </span>
                );
              }
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                    isDark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-surface border-hairline text-steel'
                  }`}
                >
                  {MetaIcon && <MetaIcon className="w-3.5 h-3.5" aria-hidden="true" />}
                  {item.label}
                </span>
              );
            })}
          </div>
        )}

        {footerLabel && (
          <div
            className={`flex items-center gap-1.5 text-sm font-semibold mt-4 pt-4 border-t transition-colors ${
              isDark
                ? 'border-white/10 text-brand-green group-hover:text-white'
                : 'border-hairline-soft text-forest group-hover:text-brand-green-dark'
            }`}
          >
            {footerLabel}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </div>
        )}
      </div>
    </Link>
  );
}
