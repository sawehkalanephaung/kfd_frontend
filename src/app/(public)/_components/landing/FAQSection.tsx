"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus, ArrowRight } from "lucide-react";

export default function FAQSection({ faqs }: { faqs: any[] }) {
  const defaultFaqs = [
    {
      question: "How do I apply for a community forest protection permit?",
      answer: "You can apply for a permit by contacting your local KFD district office or submitting an initial request through our online portal. Our officers will guide you through the required documentation and assessment process."
    },
    {
      question: "What are the rules and regulations within protected areas?",
      answer: "Protected areas strictly prohibit commercial logging, hunting of endangered species, and unauthorized land clearing. Limited subsistence gathering may be allowed under specific community forestry agreements."
    },
    {
      question: "How can NGOs and external entities partner with KFD?",
      answer: "We welcome partnerships that align with our conservation goals. Interested organizations should submit a proposal detailing the project scope, intended outcomes, and community benefits to our central headquarters."
    },
    {
      question: "Where can I report illegal logging or wildlife poaching?",
      answer: "Reports can be submitted anonymously through our Contact page, or directly to our hotline. Our rangers are on duty 24/7 to respond to verified reports."
    },
    {
      question: "Is KFD's forest data publicly accessible?",
      answer: "Yes, we publish annual reports and certain datasets related to forest cover and biodiversity. Detailed mapping data may require a formal request for academic or conservation research purposes."
    }
  ];

  const displayFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left Column: Heading & Contact Box */}
          <div className="lg:col-span-5 flex flex-col">
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
          <div className="lg:col-span-7">
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
                    <span className="text-[#1a3626] shrink-0">
                      {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                    </span>
                  </button>
                  
                  {/* Expandable Content */}
                  <div 
                    id={`faq-content-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-8 pb-6 text-steel leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
