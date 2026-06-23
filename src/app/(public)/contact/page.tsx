import { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ContactForm from "./ContactForm";
import FaqAccordion from "./FaqAccordion";
import { ContactSettings, Faq } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const metadata: Metadata = {
  title: "Contact Us - KFD",
  description: "Get in touch with the Kawthoolei Forestry Department.",
};

async function getContactSettings(): Promise<ContactSettings | null> {
  try {
    const res = await fetch(`${API}/api/v1/public/contact-settings`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json; // Assuming the endpoint returns the object directly, or json.data if wrapped
  } catch {
    return null;
  }
}

async function getFaqs(): Promise<Faq[]> {
  try {
    const res = await fetch(`${API}/api/faqs`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data || []);
  } catch {
    return [];
  }
}

export default async function ContactPage() {
  const [settingsRaw, faqsRaw] = await Promise.all([
    getContactSettings(),
    getFaqs(),
  ]);

  // Handle potential wrapper objects
  const settings = (settingsRaw as any)?.data || settingsRaw;
  const faqs = (faqsRaw as any)?.data || faqsRaw;

  const address = settings?.physicalAddress || "123 Conservation Way\nKawthoolei Region\nForest District 04";
  const phone = settings?.phoneNumbers?.[0] || "+1 (234) 567-890";
  const email = settings?.contactEmail || "info@kfd.gov";
  const officeHours = settings?.officeHours || "Mon-Fri, 08:00 - 17:00";

  return (
    <main className="min-h-screen bg-[#05110a] pt-24 pb-20">
      
      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
          Get in Touch
        </h1>
        <p className="text-white/60">
          We are here to support conservation efforts, answer your inquiries, and collaborate on preserving our environmental heritage.
        </p>
      </section>

      {/* ── Split Form & Direct Contact ─────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-24">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left: Form */}
          <div className="flex-1 w-full">
            <ContactForm settings={settings} />
          </div>

          {/* Right: Direct Contact */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-[#091810] rounded-xl p-6 sm:p-8 border border-[#132d1f]">
              
              {/* Office Hours Badge */}
              <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Offices Open - {officeHours}
              </div>

              <h2 className="text-xl font-serif text-white mb-6">Direct Contact</h2>

              <div className="space-y-6">
                {/* Headquarters */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#132d1f] flex items-center justify-center shrink-0 text-white/60">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Headquarters</h3>
                    <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{address}</p>
                  </div>
                </div>

                {/* Direct Line */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#132d1f] flex items-center justify-center shrink-0 text-white/60">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Direct Line</h3>
                    <p className="text-sm text-white/80">{officeHours.split(',')[0] || 'Mon-Fri'}, {officeHours.split(',')[1] || '08:00 - 17:00'}</p>
                    <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-sm font-semibold text-green-400 hover:text-green-300 transition-colors block mt-0.5">
                      {phone}
                    </a>
                  </div>
                </div>

                {/* Electronic Mail */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#132d1f] flex items-center justify-center shrink-0 text-white/60">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Electronic Mail</h3>
                    <p className="text-sm text-white/80">General Inquiries</p>
                    <a href={`mailto:${email}`} className="text-sm font-semibold text-green-400 hover:text-green-300 transition-colors block mt-0.5">
                      {email}
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-serif text-white mb-8 text-center sm:text-left">
          Frequently Asked Questions
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

    </main>
  );
}
