"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, Map as MapIcon, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MediaAsset } from "./types";
import { getMediaUrl } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function SearchForm({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<MediaAsset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fetch
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: query, size: "5" });
        const res = await fetch(`${API}/api/v1/public/media?${params}`);
        if (res.ok) {
          const json = await res.json();
          setSuggestions(json.data?.content || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Helper to highlight matching text
  const highlightMatch = (text: string, match: string) => {
    if (!match) return text;
    // Escape special regex characters
    const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedMatch})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="text-green-400 font-bold bg-green-500/10 px-0.5 rounded">{part}</span> : part
    );
  };

  return (
    <div ref={wrapperRef} className="w-full max-w-2xl mx-auto relative text-left">
      <form action="/resources" method="GET" className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
        <input
          type="text"
          name="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Search policies, reports, or keywords..."
          className="w-full bg-[#0a1f14] border border-[#132d1f] rounded-lg py-4 pl-12 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {/* Dropdown Suggestions */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a1f14] border border-[#132d1f] rounded-lg shadow-2xl overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-white/50">Loading suggestions...</div>
          ) : suggestions.length > 0 ? (
            <div>
              <div className="max-h-[300px] overflow-y-auto">
                {suggestions.map((doc) => {
                  const isMap = doc.fileType?.includes("zip") || doc.mediaCategory?.toLowerCase().includes("spatial");
                  const title = doc.fileName.replace(/\.[^/.]+$/, "");
                  return (
                    <a
                      key={doc.id}
                      href={getMediaUrl(doc.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 hover:bg-[#132d1f] border-b border-[#132d1f]/50 transition-colors group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="shrink-0 text-white/40 group-hover:text-brand-green transition-colors">
                        {isMap ? <MapIcon size={18} /> : <FileText size={18} />}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm text-white/90 truncate">
                          {highlightMatch(title, query.trim())}
                        </div>
                        {doc.mediaCategory && (
                          <div className="text-xs text-white/40 mt-0.5 flex items-center gap-2">
                            <span>{doc.mediaCategory}</span>
                            <span className="text-[10px] uppercase font-mono bg-canvas/5 px-1.5 py-0.5 rounded">
                              {doc.fileType ? doc.fileType.split('/').pop()?.toUpperCase() : 'FILE'}
                            </span>
                          </div>
                        )}
                      </div>
                      <ArrowRight size={14} className="text-white/20 group-hover:text-brand-green opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </a>
                  );
                })}
              </div>
              <div className="p-2 border-t border-[#132d1f] bg-[#05110a]/50">
                <Link
                  href={`/resources?search=${encodeURIComponent(query.trim())}`}
                  className="block w-full text-center py-2 text-sm text-green-400 hover:text-brand-green hover:bg-surface-soft0/10 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  View all results for "{query.trim()}"
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-white/50">
              No results found for "{query.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
