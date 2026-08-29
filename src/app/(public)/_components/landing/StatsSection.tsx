'use client';

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ContentFallback } from "@/components/content-fallback";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function AnimatedStat({ valueStr, label, subLabel, delay = 0 }: { valueStr: string, label: string, subLabel: string, delay?: number }) {
  const numberRef = useRef<HTMLSpanElement>(null);
  
  // Parse number and suffix/prefix (e.g. "50M+", "14%", "$500")
  const match = String(valueStr).match(/^([^\d]*)([\d.,]+)([^\d]*)$/);
  
  useGSAP(() => {
    if (!numberRef.current || !match) return;
    
    const prefix = match[1] || "";
    const numStr = match[2].replace(/,/g, ''); // handle commas if any
    const num = parseFloat(numStr);
    const suffix = match[3] || "";
    
    if (isNaN(num)) return; // Fallback if not a number
    
    // Create a proxy object to animate
    const proxy = { val: 0 };
    
    gsap.to(proxy, {
      val: num,
      duration: 2,
      ease: "power3.out",
      delay: delay,
      scrollTrigger: {
        trigger: numberRef.current,
        start: "top 85%", // Trigger when element is 85% down the viewport
        once: true
      },
      onUpdate: () => {
        if (numberRef.current) {
          // Format with commas if it's large, but keep it simple here
          // If original had decimals, keep 1 decimal place, else 0
          const decimals = numStr.includes('.') ? 1 : 0;
          numberRef.current.innerText = `${prefix}${proxy.val.toFixed(decimals)}${suffix}`;
        }
      }
    });
  }, { scope: numberRef });

  return (
    <div className="flex flex-col px-4 lg:px-12 items-center lg:items-start">
      <span ref={numberRef} className="text-3xl lg:text-4xl font-bold text-on-dark-muted mb-2">
        {/* Render 0 initially if it's a number, otherwise just render the string */}
        {match && !isNaN(parseFloat(match[2])) ? `${match[1]}0${match[3]}` : valueStr}
      </span>
      <span className="text-sm font-bold tracking-wider text-green-400 mb-1">{label}</span>
      {subLabel && <span className="text-xs text-on-dark-muted/70">{subLabel}</span>}
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
