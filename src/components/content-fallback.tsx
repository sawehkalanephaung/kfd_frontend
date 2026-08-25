import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react';

/**
 * Inline "nothing to show here" block for a content section or list page.
 *
 * Two distinct situations get two distinct looks, mirroring the split already
 * established between `notFound()` and `(public)/error.tsx`: `variant="error"`
 * for "we couldn't reach the backend" (something is actually broken, visitor
 * should know), `variant="empty"` for "the backend answered, there's just
 * nothing configured yet" (normal, not alarming). Server component — no
 * client JS needed for a static message block.
 */
export function ContentFallback({
  variant,
  title,
  message,
  icon: Icon,
  className = '',
  tone = 'light',
}: {
  variant: 'error' | 'empty';
  title: string;
  message?: string;
  icon?: LucideIcon;
  className?: string;
  /** 'light' (default) for canvas/surface backgrounds; 'dark' for sections
   *  pinned to a dark background (e.g. hero bands) where the theme-aware
   *  slate/steel tokens would render too dark to read. */
  tone?: 'light' | 'dark';
}) {
  const DefaultIcon = variant === 'error' ? AlertTriangle : Inbox;
  const ResolvedIcon = Icon || DefaultIcon;
  const titleClass = tone === 'dark' ? 'text-white' : 'text-slate';
  const messageClass = tone === 'dark' ? 'text-white/60' : 'text-steel';
  const iconWrapClass = tone === 'dark'
    ? 'bg-white/10'
    : variant === 'error' ? 'bg-surface-feature' : 'bg-surface';
  const iconClass = tone === 'dark'
    ? 'text-white/70'
    : variant === 'error' ? 'text-brand-green-dark' : 'text-muted';

  return (
    <div className={`text-center py-16 px-4 ${className}`}>
      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${iconWrapClass}`}>
        <ResolvedIcon className={`h-7 w-7 ${iconClass}`} aria-hidden="true" />
      </div>
      <h3 className={`text-lg font-semibold mb-1 ${titleClass}`}>{title}</h3>
      {message && <p className={`text-sm max-w-md mx-auto ${messageClass}`}>{message}</p>}
    </div>
  );
}
