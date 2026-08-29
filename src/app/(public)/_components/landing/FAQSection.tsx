"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ContentFallback } from "@/components/content-fallback";
import { Accordion } from "@/components/ui/accordion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function FAQSection({ faqs, status }: { faqs: any[]; status: 'ok' | 'empty' | 'error' }) {
  const displayFaqs = faqs || [];

  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (status === 'empty' || !leftColRef.current || !rightColRef.current || !sectionRef.current) return;

    gsap.fromTo(leftColRef.current,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true
        }
      }
    );

    gsap.fromTo(rightColRef.current,
      { opacity: 0, x: 30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true
        }
      }
    );
  }, { scope: sectionRef });

  if (status === 'empty') return null;

  return (
    <section ref={sectionRef} className="py-24 bg-surface overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Left Column: Heading & Contact Box */}
          <div ref={leftColRef} className="lg:col-span-5 flex flex-col">
            <h2 className="text-3xl lg:text-4xl font-bold text-ink mb-6">
              All You Need to Know
            </h2>
            <p className="text-steel mb-10 max-w-md text-lg">
              Find quick answers to the most common questions about KFD policies, permits, and conservation efforts.
            </p>

            {/* Contact Box */}
            <div className="bg-canvas border border-hairline shadow-sm rounded-xl p-8 max-w-sm">
              <h3 className="font-bold text-xl text-ink mb-3">Still have questions?</h3>
              <p className="text-sm text-steel mb-6">
                Cannot find the answers you're looking for? Reach out to our support team.
              </p>
              <Link
                href="/contact"
                className="bg-brand-green hover:bg-primary-deep text-on-primary font-bold px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-2 w-full"
              >
                Contact Us
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Right Column: Accordion */}
          <div ref={rightColRef} className="lg:col-span-7">
            {status === 'error' ? (
              <div className="bg-canvas border border-hairline shadow-sm rounded-xl overflow-hidden">
                <ContentFallback variant="error" title="FAQs unavailable" message="We couldn't load frequently asked questions right now." />
              </div>
            ) : (
              <Accordion
                variant="light"
                defaultOpenIndex={0}
                items={displayFaqs.map((faq, index) => ({ id: faq.id ?? index, question: faq.question, answer: faq.answer }))}
              />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
