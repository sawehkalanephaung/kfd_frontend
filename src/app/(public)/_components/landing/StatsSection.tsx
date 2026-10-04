'use client';

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ContentFallback } from "@/components/content-fallback";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function AnimatedStat({ valueStr, label, subLabel, delay = 0 }: { valueStr: string, label: string, subLabel: string, delay?: number }) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Parse number and suffix/prefix (e.g. "50M+", "14%", "$500")
  const match = String(valueStr).match(/^([^\d]*)([\d.,]+)([^\d]*)$/);

  useGSAP(() => {
    if (!numberRef.current || !match) return;

    const prefix = match[1] || "";
    const numStr = match[2].replace(/,/g, ''); // handle commas if any
    const num = parseFloat(numStr);
    const suffix = match[3] || "";

    if (isNaN(num)) return; // Fallback if not a number

    const decimals = numStr.includes('.') ? 1 : 0;
    const hasGrouping = match[2].includes(',');
    const format = (v: number) =>
      hasGrouping
        ? v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : v.toFixed(decimals);

    // Reduced motion: keep the real value, no counting tween.
    if (prefersReducedMotion) {
      numberRef.current.innerText = valueStr;
      return;
    }

    // The server-rendered HTML carries the real figure, so no-JS, print and
    // slow-JS visitors never see "0+". Only once the script runs do we rewind
    // to zero and count up to it.
    numberRef.current.innerText = `${prefix}${format(0)}${suffix}`;

    // Create a proxy object to animate
    const proxy = { val: 0 };

    gsap.to(proxy, {
      val: num,
      duration: 2,
      ease: "power3.out",
      delay: delay,
      scrollTrigger: {
        trigger: numberRef.current,
        start: "top bottom", // Count as soon as any of it is on screen, so a visible figure never sits at 0
        once: true
      },
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.innerText = `${prefix}${format(proxy.val)}${suffix}`;
        }
      },
      // Land on the exact authored string (keeps "200,000+" / "15 M+" as written).
      onComplete: () => {
        if (numberRef.current) numberRef.current.innerText = valueStr;
      },
    });
  }, { scope: numberRef, dependencies: [prefersReducedMotion] });

  return (
    <div
      className="flex flex-col px-4 lg:px-12 items-center lg:items-start"
      // The visible number counts up frame-by-frame purely as a sighted-user
      // animation; that's meaningless read out loud, and would otherwise
      // spam a screen reader with every intermediate value. One static
      // label carries the real (final) figure instead - see A11Y-20.
      aria-label={`${valueStr} ${label}`}
    >
      <span ref={numberRef} aria-hidden="true" className="text-3xl lg:text-4xl font-bold text-on-dark-muted mb-2">
        {valueStr}
      </span>
      <span aria-hidden="true" className="text-sm font-bold tracking-wider text-green-400 mb-1">{label}</span>
      {subLabel && <span aria-hidden="true" className="text-xs text-on-dark-muted/70">{subLabel}</span>}
    </div>
  );
}

export default function StatsSection({ metrics, status }: { metrics: any[]; status: 'ok' | 'empty' | 'error' }) {
  if (status === 'empty') return null;

  if (status === 'error') {
    return (
      <section className="bg-forest-700 text-white py-12 border-t border-forest">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ContentFallback variant="error" tone="dark" title="Statistics unavailable" message="We couldn't load the latest figures right now." />
        </div>
      </section>
    );
  }

  const displayStats = metrics.map(m => ({
    value: m.metricValue,
    label: m.title,
    subLabel: m.description || ""
  }));

  return (
    <section className="bg-forest-700 text-white py-12 border-t border-forest">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-y-8 lg:gap-y-0 lg:divide-x lg:divide-green-800/50">
          {displayStats.slice(0, 4).map((stat, index) => (
            <AnimatedStat 
              key={index} 
              valueStr={stat.value} 
              label={stat.label} 
              subLabel={stat.subLabel}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
