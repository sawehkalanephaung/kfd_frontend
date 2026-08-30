'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  name: string;
  href: string;
}

/**
 * Top-level nav item with a submenu. The label itself is a real link (so
 * Enter navigates straight to the hub page, matching prior behavior); a
 * separate chevron button toggles the submenu so keyboard users can open
 * it without leaving the page. Desktop mouse users still get hover-to-open.
 *
 * Previously this was pure CSS (`group-hover`), which meant the submenu
 * was entirely unreachable by keyboard (WCAG 2.1.1 failure) — see
 * UI_ACCESSIBILITY_AUDIT A11Y-13.
 */
export function NavDropdown({ name, href, items }: { name: string; href: string; items: DropdownItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
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
    if (e.key === 'Escape') {
      setIsOpen(false);
      toggleRef.current?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-0.5 py-4">
        <Link
          href={href}
          className="interactive-link text-sm font-medium py-4"
        >
          {name}
        </Link>
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls={menuId}
          aria-label={`Toggle ${name} submenu`}
          onClick={() => setIsOpen((v) => !v)}
          className="p-1 -m-0.5 rounded text-muted hover:text-interactive-hover transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40"
        >
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <div
        id={menuId}
        role="group"
        aria-label={`${name} submenu`}
        className={`absolute top-full left-0 w-48 bg-canvas border border-hairline shadow-lg rounded-md overflow-hidden transition-all duration-200 z-50 transform origin-top-left ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <div className="py-2">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="dropdown-row-hover block px-4 py-2 text-sm text-interactive hover:text-interactive-hover transition-all duration-200 ease-in-out outline-none focus-visible:bg-dropdown-hover focus-visible:text-interactive-hover"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
