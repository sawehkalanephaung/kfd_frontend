"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Faq } from "./types";

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} className="bg-[#091810] border border-[#132d1f] rounded-lg overflow-hidden transition-all">
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-[#0a1f14] transition-colors"
            >
              <span className="font-semibold text-white/90 text-sm sm:text-base">{faq.question}</span>
              <ChevronDown 
                size={20} 
                className={`text-white/40 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
              />
            </button>
            <div 
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-5 sm:p-6 pt-0 text-white/60 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
