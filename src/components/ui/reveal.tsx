'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type RevealDirection = 'up' | 'left' | 'right';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Wrapper tag - keeps the semantic landmark a plain <div> would lose
   *  when this replaces a page's own <section>. */
  as?: 'div' | 'section';
  /** 'up' (default) fits a single stacked block; 'left'/'right' fit one side
   *  of a two-column split, matching FAQSection's existing left/right pair. */
  direction?: RevealDirection;
  /** Plays immediately on mount instead of waiting for scroll - for whatever
   *  sits in the page's initial viewport (its hero/header). */
  onMount?: boolean;
  /** Reveals each direct child in sequence instead of the wrapper as one
   *  block - for a grid/list of cards. */
  stagger?: boolean;
  delay?: number;
}

const OFFSET: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
};

/**
 * Shared entry animation for interior pages (Chairman, Departments, News,
 * Resources, Contact) - previously only the homepage sections animated at
 * all. Same recipe as those sections (fade + slide, power3.out, ~0.8s,
 * ScrollTrigger "top 85%" once) via one component instead of copy-pasting
 * the useGSAP/ScrollTrigger boilerplate into a dozen more files. Wraps
 * already-rendered children in a plain div, so a server component page can
 * pass its server-rendered JSX straight through.
 */
export function Reveal({
  children,
  className = '',
  as = 'div',
  direction = 'up',
  onMount = false,
  stagger = false,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets: Element | Element[] = stagger ? Array.from(el.children) : el;

      if (prefersReducedMotion) {
        gsap.set(targets, { opacity: 1, x: 0, y: 0 });
        return;
      }

      const { x, y } = OFFSET[direction];
      gsap.fromTo(
        targets,
        { opacity: 0, x, y },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.8,
          delay,
          ease: 'power3.out',
          stagger: stagger ? 0.12 : 0,
          ...(onMount
            ? {}
            : { scrollTrigger: { trigger: el, start: 'top 85%', once: true } }),
        }
      );
    },
    { scope: ref, dependencies: [prefersReducedMotion] }
  );

  if (as === 'section') {
    return (
      <section ref={ref} className={className}>
        {children}
      </section>
    );
  }

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
