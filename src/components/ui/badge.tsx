import type { LucideIcon } from 'lucide-react';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  tone: BadgeTone;
  icon?: LucideIcon;
  /** 'md' is the standard desktop-table pill; 'sm' is for tight mobile-card rows. */
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-success-bg text-success-text border border-brand-green/20',
  warning: 'bg-warning-bg text-warning-text border border-amber-200',
  danger: 'bg-danger-bg text-danger-text border border-danger/20',
  neutral: 'bg-surface text-slate border border-hairline-strong',
  info: 'bg-info-bg text-info-text border border-blue-200',
};

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'gap-1 px-1.5 py-0.5 text-[10px]',
  md: 'gap-1.5 px-2.5 py-1 text-xs',
};

const ICON_SIZE: Record<'sm' | 'md', string> = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
};

/**
 * Shared status/state pill. Previously rebuilt ad hoc in ~10 admin
 * list pages (some duplicated a second time for a mobile-card layout
 * in the same file) with drifting padding, radius, and font size - see
 * UI_ACCESSIBILITY_AUDIT §3. Every usage already paired an icon with
 * the color, which is the right pattern (not color-only) - this keeps
 * that intact rather than reinventing it.
 */
export function Badge({ tone, icon: Icon, size = 'md', className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]} ${className}`}
    >
      {Icon && <Icon className={ICON_SIZE[size]} aria-hidden="true" />}
      {children}
    </span>
  );
}
