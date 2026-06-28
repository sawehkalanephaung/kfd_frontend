'use client';

import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useSidebar } from '@/components/sidebar-context';

export default function Header() {
  const { setIsOpen, isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <header className="flex items-center justify-between md:justify-end gap-3 mb-6 md:mb-8">
      {/* Menu Button (Mobile Open / Desktop Collapse) */}
      <button 
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsOpen(true);
          } else {
            setIsCollapsed(!isCollapsed);
          }
        }}
        className="mr-auto w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-gray-700 hover:text-emerald-600 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3">
        {/* Search Button */}
      <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
        <Search className="w-5 h-5" />
      </button>

      {/* Notification Button */}
      <button className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
        <Bell className="w-5 h-5" />
        {/* Optional small dot for unread notifications */}
        {/* <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> */}
      </button>

      {/* Profile Pill */}
      <button className="bg-white rounded-full flex items-center gap-3 p-1.5 pr-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-md transition-shadow ml-2">
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="Saw Eh Soe" 
            className="w-full h-full object-cover"
          />
        </div>
          <div className="flex flex-col items-start hidden sm:flex">
            <span className="text-[14px] font-semibold text-gray-900 leading-tight">Saw Eh Soe</span>
            <span className="text-[12px] font-medium text-gray-500 leading-tight mt-0.5">Profile</span>
          </div>
        </button>
      </div>
    </header>
  );
}
