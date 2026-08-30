'use client';

import { useId, useState } from 'react';
import { ChevronDown, Minus, Plus } from 'lucide-react';

export interface AccordionItem {
  id: string | number;
  question: string;
  answer: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  /**
   * 'light' (canvas card list, divided rows, +/- icon) matches the landing
   * page FAQ; 'dark' (individually-bordered dark cards, chevron icon)
   * matches the contact page FAQ. These were two independently-built
   * implementations with diverging accessibility (see
   * UI_ACCESSIBILITY_AUDIT A11Y-21) - this component is the single
   * source both now render through, so a future third FAQ list can't
   * reintroduce that drift.
   */
  variant?: 'light' | 'dark';
  /** Index to start expanded, or null/undefined to start fully collapsed. */
  defaultOpenIndex?: number | null;
  className?: string;
}

export function Accordion({ items, variant = 'light', defaultOpenIndex = null, className = '' }: AccordionProps) {
  const [openId, setOpenId] = useState<string | number | null>(
    defaultOpenIndex != null ? items[defaultOpenIndex]?.id ?? null : null
  );
  const uid = useId();
  const isDark = variant === 'dark';

  return (
    <div
      className={
        (isDark
          ? 'space-y-4 max-w-3xl mx-auto w-full'
          : 'bg-canvas border border-hairline shadow-sm rounded-xl overflow-hidden divide-y divide-hairline') +
        (className ? ` ${className}` : '')
      }
    >
      {items.map((item) => {
        const isOpen = openId === item.id;
        const buttonId = `${uid}-button-${item.id}`;
        const panelId = `${uid}-panel-${item.id}`;

        return (
          <div key={item.id} className={isDark ? 'bg-[#091810] border border-[#132d1f] rounded-lg overflow-hidden transition-all' : 'w-full'}>
            <button
              id={buttonId}
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className={
                isDark
                  ? 'w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-[#0a1f14] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green'
                  : 'w-full text-left px-8 py-6 flex items-center justify-between hover:bg-surface transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green'
              }
            >
              <span className={isDark ? 'font-semibold text-white/90 text-sm sm:text-base pr-8' : 'font-bold text-ink pr-8'}>
                {item.question}
              </span>
              {isDark ? (
                <ChevronDown
                  size={20}
                  aria-hidden="true"
                  className={`text-white/40 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              ) : (
                <span className="text-brand-text shrink-0" aria-hidden="true">
                  {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              )}
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={
                isDark
                  ? `grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`
                  : `overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`
              }
            >
              <div className={isDark ? 'overflow-hidden' : undefined}>
                <div
                  className={
                    isDark
                      ? 'p-5 sm:p-6 pt-0 text-white/60 text-sm sm:text-base leading-relaxed whitespace-pre-wrap'
                      : 'px-8 pb-6 text-steel leading-relaxed'
                  }
                >
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
