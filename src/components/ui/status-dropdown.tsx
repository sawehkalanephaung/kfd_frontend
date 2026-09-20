'use client';

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { useOutsideClick } from '@/lib/use-outside-click';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export interface StatusOption {
  /** The value sent to the API (e.g. 'PUBLISHED', 'DRAFT'). */
  value: string;
  /** Human label shown in the pill and dropdown (e.g. 'Published'). */
  label: string;
  /** Tone controls color; maps to the design-system tokens. */
  tone: 'success' | 'warning' | 'neutral';
}

interface StatusDropdownProps {
  /** Current status value (must match one of the `options[].value` strings). */
  value: string;
  /** Available status choices. */
  options: StatusOption[];
  /** Called when the user selects a new status. Return a Promise for the loading state. */
  onChangeStatus: (newValue: string) => Promise<void>;
  /** 'md' for desktop tables, 'sm' for tight mobile-card rows. */
  size?: 'sm' | 'md';
  className?: string;
}

/* ─── Color maps ────────────────────────────────────────────────────────────── */

const TONE_PILL: Record<string, string> = {
  success: 'bg-success-bg text-success-text border-brand-green/20',
  warning: 'bg-warning-bg text-warning-text border-amber-200',
  neutral: 'bg-surface text-slate border-hairline-strong',
};

const TONE_DOT: Record<string, string> = {
  success: 'bg-brand-green',
  warning: 'bg-amber-500',
  neutral: 'bg-gray-500 dark:bg-gray-400',
};

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'gap-1.5 px-2 py-0.5 text-[11px]',
  md: 'gap-1.5 px-2.5 py-1 text-xs',
};

const DOT_SIZE: Record<'sm' | 'md', string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

/* ─── Component ─────────────────────────────────────────────────────────────── */

/**
 * Clickable status pill with an inline dropdown for quick-changing an item's
 * status directly from a list view. Matches the KFD admin design language:
 * colored pill + green/amber/gray dot + chevron ▼.
 */
export function StatusDropdown({
  value,
  options,
  onChangeStatus,
  size = 'md',
  className = '',
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const open = useCallback(() => {
    if (loading) return;
    updatePosition();
    setIsOpen(true);
    const idx = options.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [loading, options, value, updatePosition]);

  // wrapperRef (trigger) and portalRef (the portaled panel below, rendered
  // outside this component's DOM subtree via createPortal) both count as
  // "inside" — otherwise a click on the panel itself would look like an
  // outside click and close it before commitIndex handles the selection.
  useOutsideClick([wrapperRef, portalRef], close, isOpen);

  // Keep the portal's position in sync while open (the trigger can move
  // under it from page scroll or a viewport resize).
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const commitIndex = async (index: number) => {
    const option = options[index];
    if (!option || option.value === value) {
      close();
      return;
    }
    close();
    setLoading(true);
    try {
      await onChangeStatus(option.value);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (loading) return;

    if (!isOpen) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        open();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) commitIndex(activeIndex);
        break;
      case 'Tab':
        close();
        break;
      default:
        break;
    }
  };

  const activeOptionId =
    isOpen && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;

  if (!current) return null;

  const dropdownContent = (
    <div
      ref={portalRef}
      id={`${listboxId}-container`}
      style={{
        position: 'absolute',
        top: `${coords.top + 6}px`,
        left: `${coords.left}px`,
        minWidth: Math.max(140, coords.width)
      }}
      className={`
        z-[9999]
        bg-surface border border-hairline-strong rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)]
        origin-top-left transition duration-200 ease-out
        ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
      `}
    >
      <ul id={listboxId} role="listbox" className="p-1.5 space-y-0.5">
        {options.map((option, index) => {
          const isSelected = option.value === value;
          return (
            <li key={option.value} role="presentation">
              <div
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={(e) => { e.stopPropagation(); commitIndex(index); }}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-xs font-medium
                  transition-all duration-150
                  ${index === activeIndex
                    ? 'bg-dropdown-hover'
                    : isSelected
                      ? 'bg-brand-green-soft text-brand-green-dark'
                      : 'text-ink hover:bg-surface-soft'
                  }
                `}
              >
                {/* Colored dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${TONE_DOT[option.tone]}`} />
                <span className="flex-1">{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-green-dark" />}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className={`relative inline-block ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={wrapperRef}>
      {/* ── Pill trigger ─────────────────────────────────── */}
      <button
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={activeOptionId}
        aria-label={`Status: ${current.label}. Click to change.`}
        tabIndex={0}
        disabled={loading}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        className={`
          inline-flex items-center rounded-full font-semibold border cursor-pointer select-none
          transition-all duration-200 outline-none
          focus-visible:ring-2 focus-visible:ring-brand-green/30
          hover:shadow-sm
          ${SIZE_CLASSES[size]}
          ${TONE_PILL[current.tone]}
          ${loading ? 'opacity-70 cursor-wait' : ''}
        `}
      >
        {/* Dot indicator - always visible */}
        <span className={`${DOT_SIZE[size]} rounded-full shrink-0 ${TONE_DOT[current.tone]}`} aria-hidden="true" />

        <span className="tracking-wide uppercase">{current.label}</span>

        {/* Chevron or Spinner */}
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin text-inherit opacity-70" aria-hidden="true" />
        ) : (
          <ChevronDown
            aria-hidden="true"
            className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* ── Dropdown Portal ─────────────────────────────────────── */}
      {mounted && createPortal(dropdownContent, document.body)}
    </div>
  );
}
