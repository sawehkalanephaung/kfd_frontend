'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks the `prefers-reduced-motion` media query. GSAP entry/parallax
 * animations across the public site previously ran unconditionally,
 * unlike the CSS-only `.scroll-reveal` fallback in globals.css, which
 * already gated itself on this query — see UI_ACCESSIBILITY_AUDIT
 * A11Y-19/A11Y-20. Read it once per component and skip straight to the
 * animation's end state (via `gsap.set`) instead of animating when true.
 */
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(query.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}
