import { Metadata } from "next";
import { MapPin, Phone, Mail } from "lucide-react";
import ContactForm from "./ContactForm";
import FaqAccordion from "./FaqAccordion";
import { ContentFallback } from "@/components/content-fallback";
import { ContactSettings, Faq } from "./types";
import { PageHero } from "@/components/ui/page-hero";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const metadata: Metadata = {
  title: "Contact Us - KFD",
  description: "Get in touch with the Kawthoolei Forestry Department.",
};

/**
 * This page's whole purpose is showing real contact details, so a fetch
 * failure here throws (→ `(public)/error.tsx` retry UI) rather than
 * quietly falling back to fabricated-looking contact info. Settings simply
 * not configured yet is a different, non-error case — handled below.
 */
async function getContactSettings(): Promise<ContactSettings | null> {
  const res = await fetch(`${API}/api/v1/public/contact-settings`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load contact settings: ${res.status}`);
  const json = await res.json();
  return json;
}

async function getFaqs(): Promise<Faq[]> {
  try {
    const res = await fetch(`${API}/api/v1/public/faqs`, { cache: "no-store" });
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

  const address: string | undefined = settings?.physicalAddress || undefined;
  const phone: string | undefined = settings?.phoneNumbers?.[0] || undefined;
  const email: string | undefined = settings?.contactEmail || undefined;
  const officeHours: string | undefined = settings?.officeHours || undefined;
  const hasAnyContactDetail = Boolean(address || phone || email || officeHours);

  return (
    <main className="min-h-screen bg-forest-950 pb-20">
      <PageHero
        title="Get in Touch"
        subtitle="We are here to support conservation efforts, answer your inquiries, and collaborate on preserving our environmental heritage."
        titleFont="serif"
      />

      {/* ── Split Form & Direct Contact ─────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mt-16 mb-24">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left: Form */}
          <div className="flex-1 w-full">
            <ContactForm settings={settings} />
          </div>

          {/* Right: Direct Contact */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-[#091810] rounded-xl p-6 sm:p-8 border border-[#132d1f]">

              {!hasAnyContactDetail ? (
                <ContentFallback
                  variant="empty"
                  tone="dark"
                  title="Contact details coming soon"
                  message="We haven't published direct contact information yet — the form to the left still reaches us."
                  className="!py-4"
                />
              ) : (
                <>
                  {/* Office Hours Badge */}
                  {officeHours && (
                    <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6 border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      Offices Open - {officeHours}
                    </div>
                  )}

                  <h2 className="text-xl font-serif text-white mb-6">Direct Contact</h2>

                  <div className="space-y-6">
                    {/* Headquarters */}
                    {address && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#132d1f] flex items-center justify-center shrink-0 text-white/60">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Headquarters</h3>
                          <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{address}</p>
                        </div>
                      </div>
                    )}

                    {/* Direct Line */}
                    {phone && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#132d1f] flex items-center justify-center shrink-0 text-white/60">
                          <Phone size={18} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Direct Line</h3>
                          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-sm font-semibold text-green-400 hover:text-brand-green transition-colors block mt-0.5">
                            {phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Electronic Mail */}
                    {email && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#132d1f] flex items-center justify-center shrink-0 text-white/60">
                          <Mail size={18} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Electronic Mail</h3>
                          <p className="text-sm text-white/80">General Inquiries</p>
                          <a href={`mailto:${email}`} className="text-sm font-semibold text-green-400 hover:text-brand-green transition-colors block mt-0.5">
                            {email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

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
