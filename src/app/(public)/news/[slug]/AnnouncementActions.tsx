"use client";

import { Share2, Download } from "lucide-react";
import { useState } from "react";

interface AnnouncementActionsProps {
  title: string;
}

export function AnnouncementActions({ title }: AnnouncementActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleDownload = () => {
    // The simplest and most robust way to generate a PDF client-side is 
    // to trigger the browser's print dialog, which allows saving as PDF.
    window.print();
  };

  return (
    <div className="flex items-center gap-3 print:hidden">
      <button 
        onClick={handleShare}
        className="flex items-center gap-2 border border-gray-300 bg-transparent text-gray-600 hover:text-gray-900 hover:border-gray-400 px-4 py-2 rounded-sm transition-colors"
      >
        <Share2 size={14} />
        {copied ? "Copied!" : "Share"}
      </button>
      <button 
        onClick={handleDownload}
        className="flex items-center gap-2 border border-gray-300 bg-transparent text-gray-600 hover:text-gray-900 hover:border-gray-400 px-4 py-2 rounded-sm transition-colors"
      >
        <Download size={14} />
        Download PDF
      </button>
    </div>
  );
}
