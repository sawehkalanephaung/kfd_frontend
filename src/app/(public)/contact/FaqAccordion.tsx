"use client";

import { Accordion } from "@/components/ui/accordion";
import { Faq } from "./types";

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <Accordion
      variant="dark"
      items={faqs.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }))}
    />
  );
}
