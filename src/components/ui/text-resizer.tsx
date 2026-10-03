'use client';

import { useSyncExternalStore } from 'react';
import { TEXT_SCALE_STORAGE_KEY } from '@/lib/text-scale';

/** Reader text-size steps. 1 is the page's designed size. */
const STEPS = [0.9, 1, 1.15, 1.3, 1.5] as const;
const DEFAULT_SCALE = 1;

const CHANGE_EVENT = 'kfd:text-scale';

function readScale(): number {
  try {
    const stored = parseFloat(window.localStorage.getItem(TEXT_SCALE_STORAGE_KEY) ?? '');
    return STEPS.includes(stored as (typeof STEPS)[number]) ? stored : DEFAULT_SCALE;
  } catch {
    return DEFAULT_SCALE;
  }
}

function applyScale(scale: number) {
  const root = document.documentElement.style;
  root.setProperty('--text-scale', String(scale));
  // Blocks whose designed size is already the 16px minimum never shrink.
  root.setProperty('--text-scale-floor', String(Math.max(1, scale)));
}

function writeScale(scale: number) {
  applyScale(scale);
  try {
    window.localStorage.setItem(TEXT_SCALE_STORAGE_KEY, String(scale));
  } catch {
    // Private mode / blocked storage: the size still applies for this page.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

interface TextResizerProps {
  /** Set false on pages whose reading text is 16px by design, so "A−" stops
   *  at 100% instead of taking body text below the readable minimum. */
  allowSmaller?: boolean;
  className?: string;
}

const buttonClass =
  'flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-hairline-strong bg-canvas font-semibold text-ink ' +
  'transition-colors hover:bg-surface outline-none focus-visible:ring-2 focus-visible:ring-brand-green ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-canvas';

/**
 * "A− / A / A+" control for reading pages. It scales only the blocks marked
 * `text-resizable` (or `text-resizable-floor`), not the whole page, and the
 * choice is remembered across pages and visits.
 *
 * Place it directly above the text it resizes.
 */
export function TextResizer({ allowSmaller = true, className = '' }: TextResizerProps) {
  const stored = useSyncExternalStore(subscribe, readScale, () => DEFAULT_SCALE);

  const steps = allowSmaller ? STEPS : STEPS.filter((step) => step >= 1);
  const scale = Math.max(stored, steps[0]);
  const index = steps.indexOf(scale as (typeof STEPS)[number]);
  const percent = Math.round(scale * 100);

  return (
    <div
      role="group"
      aria-label="Text size"
      className={`flex items-center justify-end gap-2 ${className}`}
    >
      <span className="mr-1 text-sm font-medium text-steel" aria-hidden="true">
        Text size
      </span>
      <button
        type="button"
        onClick={() => writeScale(steps[index - 1])}
        disabled={index <= 0}
        aria-label="Decrease text size"
        className={`${buttonClass} text-sm`}
      >
        A−
      </button>
      <button
        type="button"
        onClick={() => writeScale(DEFAULT_SCALE)}
        disabled={scale === DEFAULT_SCALE}
        aria-label="Reset text size"
        className={`${buttonClass} text-base`}
      >
        A
      </button>
      <button
        type="button"
        onClick={() => writeScale(steps[index + 1])}
        disabled={index >= steps.length - 1}
        aria-label="Increase text size"
        className={`${buttonClass} text-lg`}
      >
        A+
      </button>
      <span className="sr-only" aria-live="polite">
        Text size {percent}%
      </span>
    </div>
  );
}
