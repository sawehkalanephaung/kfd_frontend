'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface QuickToggleProps {
  isOn: boolean;
  onLabel?: string;
  offLabel?: string;
  onToggle: (next: boolean) => Promise<void>;
  size?: 'sm' | 'md';
  className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'gap-1.5 px-2 py-0.5 text-[11px]',
  md: 'gap-1.5 px-2.5 py-1 text-xs',
};

const DOT_SIZE: Record<'sm' | 'md', string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

/**
 * One-click on/off pill for a strictly-binary field (e.g. Show/Hidden).
 * StatusDropdown is built for 3+ options behind an open-then-select menu;
 * a true binary state doesn't need a menu — clicking the pill flips it
 * directly in one interaction instead of two.
 */
export function QuickToggle({ isOn, onLabel = 'Show', offLabel = 'Hidden', onToggle, size = 'md', className = '' }: QuickToggleProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onToggle(!isOn);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={`${isOn ? onLabel : offLabel}. Click to ${isOn ? 'hide' : 'show'}.`}
      disabled={loading}
      onClick={handleClick}
      className={`
        inline-flex items-center rounded-full font-semibold border cursor-pointer select-none
        transition-all duration-200 outline-none
        focus-visible:ring-2 focus-visible:ring-brand-green/30
        hover:shadow-sm
        ${SIZE_CLASSES[size]}
        ${isOn ? 'bg-success-bg text-success-text border-brand-green/20' : 'bg-surface text-slate border-hairline-strong'}
        ${loading ? 'opacity-70 cursor-wait' : ''}
        ${className}
      `}
    >
      <span
        className={`${DOT_SIZE[size]} rounded-full shrink-0 ${isOn ? 'bg-brand-green' : 'bg-gray-500 dark:bg-gray-400'}`}
        aria-hidden="true"
      />
      <span className="tracking-wide uppercase">{isOn ? onLabel : offLabel}</span>
      {loading && <Loader2 className="w-3 h-3 animate-spin text-inherit opacity-70" aria-hidden="true" />}
    </button>
  );
}
