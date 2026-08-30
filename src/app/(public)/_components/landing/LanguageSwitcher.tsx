'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Globe } from 'lucide-react';

/**
 * Was a plain `<div aria-label="Language">` — not focusable, not operable
 * by keyboard at all (A11Y-14). The two not-yet-implemented languages
 * were real, focusable buttons that silently did nothing except carry a
 * `title` tooltip, which isn't reliably announced and is invisible
 * without hovering (A11Y-15) — they're now `aria-disabled` with a visible
 * "Coming soon" cue instead.
 */
export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label="Change language"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1 py-4 text-brand-text hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40 rounded"
      >
        <Globe className="w-5 h-5" aria-hidden="true" />
      </button>

      <div
        id={menuId}
        role="group"
        aria-label="Language"
        className={`absolute top-full right-0 w-40 bg-canvas border border-hairline shadow-lg rounded-md overflow-hidden transition-all duration-200 z-50 transform origin-top-right ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <div className="py-2">
          <button
            type="button"
            aria-current="true"
            className="dropdown-row-hover block w-full text-left px-4 py-2 text-sm text-forest font-medium bg-green-50 transition-all duration-200 ease-in-out"
          >
            English
          </button>
          <button
            type="button"
            aria-disabled="true"
            disabled
            className="flex w-full items-center justify-between text-left px-4 py-2 text-sm text-muted transition-colors cursor-not-allowed"
          >
            ကညီ (Karen)
            <span className="text-[10px] uppercase tracking-wide text-muted">Soon</span>
          </button>
          <button
            type="button"
            aria-disabled="true"
            disabled
            className="flex w-full items-center justify-between text-left px-4 py-2 text-sm text-muted transition-colors cursor-not-allowed"
          >
            မြန်မာ (Burmese)
            <span className="text-[10px] uppercase tracking-wide text-muted">Soon</span>
          </button>
        </div>
      </div>
    </div>
  );
}
