import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Upcoming Events - Kawthoolei Forestry Department",
  description: "Calendar and details for upcoming events hosted by the Kawthoolei Forestry Department.",
};

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#0b1a10] pt-20 pb-20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link href="/news" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to News
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Upcoming Events
          </h1>
          <p className="text-base text-green-300/60 max-w-xl leading-relaxed">
            Join us in our community programs, reforestation drives, and public workshops.
          </p>
        </div>

        {/* Content Placeholder */}
        <div className="bg-[#0f2318] border border-white/5 rounded-2xl p-12 text-center">
          <p className="text-white/40">There are currently no upcoming events scheduled.</p>
        </div>
      </div>
    </main>
  );
}
