"use client";

import { useState } from "react";
import { DepartmentData } from "../../../departments/types";
import { Search, Calendar, ChevronRight, Presentation, Users, CalendarDays, ChevronLeft } from "lucide-react";
import Link from "next/link";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr));
}

export default function DepartmentActivity({ data }: { data: DepartmentData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const posts = data.posts || [];

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Info */}
      <div className="lg:w-1/4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Activities</h2>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-md border-l-4 border-green-500">
            <span className="text-sm font-semibold text-green-800">All</span>
            <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {posts.length}
            </span>
          </div>
          <div className="flex items-center justify-between hover:bg-gray-50 px-4 py-3 rounded-md cursor-pointer transition-colors">
            <span className="text-sm font-medium text-gray-700">Congress & Organizational Meeting</span>
            <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {posts.filter(p => p.excerpt?.includes('Meeting') || p.excerpt?.includes('Congress')).length}
            </span>
          </div>
          <div className="flex items-center justify-between hover:bg-gray-50 px-4 py-3 rounded-md cursor-pointer transition-colors">
            <span className="text-sm font-medium text-gray-700">Training & Workshop</span>
            <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {posts.filter(p => p.excerpt?.includes('Training') || p.excerpt?.includes('Workshop')).length}
            </span>
          </div>
          <div className="flex items-center justify-between hover:bg-gray-50 px-4 py-3 rounded-md cursor-pointer transition-colors">
            <span className="text-sm font-medium text-gray-700">Event & Activity</span>
            <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {posts.filter(p => p.excerpt?.includes('Event') || p.excerpt?.includes('Activity')).length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:w-3/4 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search resources..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select className="bg-white border border-gray-200 text-sm rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer hidden sm:block">
            <option>Newest First</option>
            <option>Oldest First</option>
          </select>
        </div>

        {/* Activity List */}
        <div className="divide-y divide-gray-100">
          {filteredPosts.map((post) => {
            // Determine icon based on category/excerpt
            let Icon = CalendarDays;
            if (post.excerpt?.includes('Meeting') || post.excerpt?.includes('Congress')) Icon = Users;
            else if (post.excerpt?.includes('Training') || post.excerpt?.includes('Workshop')) Icon = Presentation;

            return (
              <div key={post.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-gray-50 transition-colors group">
                <div className="text-green-600 bg-green-50 p-3 rounded-md shrink-0">
                  <Icon size={24} />
                </div>
                
                <div className="flex-1">
                  <Link href={`/news/${post.slug}`} className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors block mb-1">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 text-gray-400 rotate-45 transform bg-gray-200 rounded-sm inline-block mr-0.5"></span>
                      {post.excerpt || 'Activity'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 shrink-0 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end border-t border-gray-100 sm:border-0 pt-4 sm:pt-0">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <Calendar size={16} className="text-gray-400" />
                    {formatDate(post.publishedAt)}
                  </div>
                  <Link href={`/news/${post.slug}`} className="text-green-500 hover:text-green-700 transition-colors bg-green-50 hover:bg-green-100 p-1.5 rounded-full">
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            );
          })}
          
          {filteredPosts.length === 0 && (
            <div className="p-12 text-center text-gray-500 text-sm">
              No activities found matching your search.
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredPosts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-6 bg-gray-50/30">
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
              Showing 1-{filteredPosts.length} of {filteredPosts.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
