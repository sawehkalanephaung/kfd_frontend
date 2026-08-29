"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { ContactSettings } from "./types";
import { CustomSelect } from "@/components/ui/custom-select";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ContactForm({ settings }: { settings: ContactSettings | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation so screen-reader users are told the
  // submission succeeded instead of the page silently swapping content
  // out from under them.
  useEffect(() => {
    if (success) successHeadingRef.current?.focus();
  }, [success]);

  const inquiryOptions = settings?.inquiryTypes?.length 
    ? settings.inquiryTypes 
    : ["General Administration & Public Information", "Conservation Programs", "Media Relations", "Report a Violation"];

  const [inquiryType, setInquiryType] = useState(inquiryOptions[0]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const payload = {
      senderName: `${formData.get("firstName")} ${formData.get("lastName")}`.trim(),
      senderEmail: formData.get("email"),
      inquiryType: inquiryType,
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch(`${API}/api/v1/public/inquiries/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to send inquiry. Please try again.");
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-[#091810] rounded-xl p-6 sm:p-8 border border-[#132d1f] w-full max-w-2xl">
      {success ? (
        <div role="status" className="flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <h3 ref={successHeadingRef} tabIndex={-1} className="text-2xl font-serif text-white mb-2 outline-none">
            Inquiry Received
          </h3>
          <p className="text-white/60 max-w-md">
            Thank you for reaching out. Your inquiry has been routed to the correct department and we will be in touch shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-8 text-sm font-semibold text-green-400 hover:text-brand-green transition-colors hover:underline"
          >
            Submit another inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          {errorMsg && (
            <div role="alert" className="p-4 rounded bg-danger-bg text-danger-text text-sm border border-danger/20">
              {errorMsg}
            </div>
          )}

          {/* Route Inquiry To */}
          <div className="space-y-1.5">
            <label htmlFor="inquiryType" className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
              Route Inquiry To
            </label>
            <div className="relative">
              <CustomSelect
                value={inquiryType}
                onChange={(val) => setInquiryType(val)}
                className="w-full bg-[#0a1f14] border border-[#132d1f] text-white text-sm rounded-md appearance-none focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                options={inquiryOptions.map((opt) => ({ value: opt, label: opt }))}
              />
            </div>
            <p className="text-[10px] text-white/40">Selecting the correct department expedites processing times.</p>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
                First Name
              </label>
              <input 
                type="text" 
                id="firstName"
                name="firstName"
                required
                placeholder="Jane"
                className="w-full bg-[#0a1f14] border border-[#132d1f] text-white text-sm rounded-md px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
                Last Name
              </label>
              <input 
                type="text" 
                id="lastName"
                name="lastName"
                required
                placeholder="Doe"
                className="w-full bg-[#0a1f14] border border-[#132d1f] text-white text-sm rounded-md px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Email Row */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
              Email Address
            </label>
            <input 
              type="email" 
              id="email"
              name="email"
              required
              placeholder="jane.doe@example.com"
              className="w-full bg-[#0a1f14] border border-[#132d1f] text-white text-sm rounded-md px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
            />
          </div>

          {/* Subject Row */}
          <div className="space-y-1.5">
            <label htmlFor="subject" className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
              Subject
            </label>
            <input 
              type="text" 
              id="subject"
              name="subject"
              required
              placeholder="Brief summary of your inquiry"
              className="w-full bg-[#0a1f14] border border-[#132d1f] text-white text-sm rounded-md px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
            />
          </div>

          {/* Message Row */}
          <div className="space-y-1.5">
            <label htmlFor="message" className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
              Message
            </label>
            <textarea 
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Please provide detailed information to help us assist you efficiently..."
              className="w-full bg-[#0a1f14] border border-[#132d1f] text-white text-sm rounded-md px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors resize-y"
            ></textarea>
          </div>

          {/* Footer & Submit */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[9px] text-white/40 max-w-[200px] leading-tight">
              By submitting this form, you acknowledge our Privacy Policy regarding data handling.
            </p>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-[#05110a] font-bold text-sm px-6 py-3 rounded-md transition-all disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Submit Inquiry <ArrowRight size={14} /></>
              )}
            </button>
          </div>
          
        </form>
      )}
    </div>
  );
}
