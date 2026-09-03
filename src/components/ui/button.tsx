import React from 'react';
import Link from 'next/link';

type ButtonSize = 'sm' | 'md';

type ButtonProps = {
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, 'className' | 'children' | 'href'>)
  | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>)
);

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'px-6 py-2.5 text-sm gap-2',
  sm: 'px-4 py-2 text-sm gap-1.5',
};

const BASE_CLASSES =
  'group inline-flex items-center justify-center whitespace-nowrap font-semibold rounded-full border border-transparent ' +
  'bg-primary text-on-primary shadow-sm ' +
  'transition-all duration-200 ease-in-out ' +
  'hover:bg-primary-deep hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 ' +
  'active:scale-95 active:translate-y-0 ' +
  'disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-sm ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

/**
 * The one primary/CTA button style for the whole app - Admin and Public
 * sites, light and dark mode. Save/Create/Submit/Subscribe/Download, etc.
 * Color comes entirely from the --color-primary/-deep/-on-primary tokens
 * in globals.css, so a future brand-color change happens in one place.
 *
 * Renders a <button> by default, or a Next.js <Link> when given `href`.
 */
export function Button({ size = 'md', className = '', children, ...props }: ButtonProps) {
  const classes = `${BASE_CLASSES} ${SIZE_CLASSES[size]} ${className}`.trim();

  if (props.href !== undefined) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
