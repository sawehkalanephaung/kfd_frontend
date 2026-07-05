"use client";

import { DepartmentData } from "../../departments/types";
import { Calendar } from "lucide-react";
import { getMediaUrl } from "@/lib/api";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(dateStr));
}

export default function DepartmentResources({ data }: { data: DepartmentData }) {
  const resources = data.resources || [];
  
  // Group by category
  const groupedResources = resources.reduce((acc, res) => {
    const category = res.mediaCategory || 'Documents';
    if (!acc[category]) acc[category] = [];
    acc[category].push(res);
    return acc;
  }, {} as Record<string, typeof resources>);

  return (
    <div className="py-8 max-w-4xl">
      {Object.entries(groupedResources).length > 0 ? (
        Object.entries(groupedResources).map(([category, items]) => (
          <div key={category} className="mb-10">
            <h3 className="text-[17px] font-bold text-gray-900 mb-4">{category}</h3>
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {items.map((res) => (
                <div key={res.id} className="py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center group">
                  <div className="flex-1">
                    <a href={getMediaUrl(res.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-[15px] text-blue-500 hover:text-blue-700 transition-colors block">
                      {res.fileName.replace(/\.[^/.]+$/, "")}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium shrink-0 mt-1 sm:mt-0">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(res.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="py-12 text-gray-500 text-sm">
          No resources found.
        </div>
      )}
    </div>
  );
}
