'use client';

import React, { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useFocusTrap } from '@/lib/use-focus-trap';

interface NavLink {
  name: string;
  href: string;
  dropdown?: { name: string; href: string }[];
}

interface MobileMenuProps {
  navLinks: NavLink[];
}

export default function MobileMenu({ navLinks }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = () => setIsOpen(false);
  useFocusTrap(isOpen, drawerRef, close);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate hover:text-teal-deep transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!isOpen}
        tabIndex={-1}
        className={`fixed top-0 right-0 z-[110] h-full w-[280px] bg-canvas shadow-2xl transition-transform duration-300 ease-in-out flex flex-col outline-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-hairline">
          <span id={titleId} className="font-bold text-lg text-forest">Menu</span>
          <button
            onClick={close}
            aria-label="Close menu"
            className="p-2 text-steel hover:text-ink rounded-lg bg-surface hover:bg-surface transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          {navLinks.map((link) => (
            <div key={link.name} className="mb-1">
              {link.dropdown ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(link.name)}
                    className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-slate hover:bg-surface-soft hover:text-teal-deep rounded-xl transition-colors"
                  >
                    {link.name}
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${openDropdown === link.name ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-200 ${
                      openDropdown === link.name ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-6 pr-4 py-2 space-y-1 border-l-2 border-hairline ml-4">
                      {link.dropdown.map((subLink) => (
                        <Link
                          key={subLink.name}
                          href={subLink.href}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-steel hover:text-teal-deep rounded-lg transition-colors"
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-slate hover:bg-surface-soft hover:text-teal-deep rounded-xl transition-colors"
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
