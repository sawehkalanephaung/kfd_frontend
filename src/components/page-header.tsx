import type { LucideIcon } from 'lucide-react';

/**
 * Shared header for every admin page — icon + Title + Subheading, with an
 * optional action slot (e.g. a Create button) on the right. Previously each
 * page hand-rolled this block, which let three different shapes emerge
 * (list-page card, settings-page card, and a bare no-icon header on every
 * create/edit page). Centralizing it here means they can't drift apart
 * again — same reasoning as the shared upload-widget and reserved-page-slug
 * fixes elsewhere in this codebase.
 */
export default function PageHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-canvas rounded-lg p-8 shadow-sm border border-hairline-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Icon className="w-6 h-6 text-brand-green" aria-hidden="true" />
          {title}
        </h1>
        <p className="text-steel mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
}
