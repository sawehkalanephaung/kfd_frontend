"use client";

import { useState } from "react";
import { DepartmentData } from "../../departments/types";
import { Search, Download, ChevronLeft, ChevronRight, FileText } from "lucide-react";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr));
}

export default function DepartmentResources({ data }: { data: DepartmentData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const resources = data.resources || [];

  const filteredResources = resources.filter(res => 
    res.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Info */}
      <div className="lg:w-1/4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Resources Library</h2>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-md border-l-4 border-green-500">
            <span className="text-sm font-semibold text-green-800">All</span>
            <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {resources.length}
            </span>
          </div>
          <div className="flex items-center justify-between hover:bg-gray-50 px-4 py-3 rounded-md cursor-pointer transition-colors">
            <span className="text-sm font-medium text-gray-700">Official Statements</span>
            <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {resources.filter(r => r.mediaCategory === 'Official Statement').length}
            </span>
          </div>
          <div className="flex items-center justify-between hover:bg-gray-50 px-4 py-3 rounded-md cursor-pointer transition-colors">
            <span className="text-sm font-medium text-gray-700">Policies & Legal Frameworks</span>
            <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {resources.filter(r => r.mediaCategory !== 'Official Statement').length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:w-3/4 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search resources..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-md text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select className="bg-gray-100 border-none text-sm rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer">
              <option>All Types</option>
              <option>PDF</option>
              <option>Word</option>
            </select>
            <select className="bg-gray-100 border-none text-sm rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer">
              <option>All Languages</option>
              <option>English</option>
              <option>Karen</option>
              <option>Burmese</option>
            </select>
            <select className="bg-gray-100 border-none text-sm rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer">
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 font-medium">
                <th className="px-6 py-4 font-medium w-[40%]">Title</th>
                <th className="px-4 py-4 font-medium text-center">Category</th>
                <th className="px-4 py-4 font-medium text-center">Language</th>
                <th className="px-4 py-4 font-medium text-center">Type</th>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium text-center">Size</th>
                <th className="px-4 py-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResources.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500 text-white p-2 rounded text-[10px] font-bold mt-0.5 shrink-0">
                        PDF
                      </div>
                      <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-800 hover:text-green-600 underline decoration-gray-300 underline-offset-4 decoration-1 hover:decoration-green-600 transition-colors">
                        {res.fileName.replace('.pdf', '')}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs border border-green-100 rounded">
                      {res.mediaCategory || 'Document'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-gray-600">
                    {res.language || 'English'}
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-gray-600">
                    PDF
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <FileText size={14} className="text-gray-400" />
                      {formatDate(res.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-gray-600">
                    {res.fileSizeKb} KB
                  </td>
                  <td className="px-4 py-4 text-center">
                    <a 
                      href={res.fileUrl} 
                      download 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center text-green-600 hover:text-green-700 bg-white border border-green-200 hover:border-green-600 p-1.5 rounded transition-colors"
                      title="Download"
                    >
                      <Download size={16} />
                    </a>
                  </td>
                </tr>
              ))}
              
              {filteredResources.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No resources found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        {filteredResources.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-6">
            <button className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1 text-sm">
              <button className="w-8 h-8 rounded-full text-gray-600 hover:bg-gray-100 flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded-full text-gray-600 hover:bg-gray-100 flex items-center justify-center">2</button>
              <button className="w-8 h-8 rounded-full text-gray-600 hover:bg-gray-100 flex items-center justify-center">3</button>
              <button className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-medium shadow-sm">4</button>
              <button className="w-8 h-8 rounded-full text-gray-600 hover:bg-gray-100 flex items-center justify-center">5</button>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <ChevronRight size={18} />
            </button>
            
            <span className="text-xs text-gray-500 ml-4 hidden sm:inline-block">
              Showing 1-{filteredResources.length} of {filteredResources.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
