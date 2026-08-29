"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Plus, Minus, ArrowRight } from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ContentFallback } from "@/components/content-fallback";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function FAQSection({ faqs, status }: { faqs: any[]; status: 'ok' | 'empty' | 'error' }) {
  const displayFaqs = faqs || [];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            <div className="bg-canvas border border-hairline shadow-sm rounded-xl overflow-hidden divide-y divide-hairline">
              {displayFaqs.map((faq, index) => (
                <div key={faq.id || index} className="w-full">
                  <button
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-content-${index}`}
                    id={`faq-button-${index}`}
                    className="w-full text-left px-8 py-6 flex items-center justify-between hover:bg-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                  >
                    <span className="font-bold text-ink pr-8">{faq.question}</span>
                    <span className="text-forest shrink-0">
                      {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                    </span>
                  </button>

                  {/* Expandable Content */}
                  <div
                    id={`faq-content-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                  >
                    <div className="px-8 pb-6 text-steel leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
