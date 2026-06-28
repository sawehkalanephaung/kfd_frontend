'use client';

import React from 'react';
import { useSidebar } from '@/components/sidebar-context';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <main 
      className={`
        flex-1 p-4 md:p-8 w-full overflow-x-hidden transition-all duration-300 ease-in-out
        ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'}
      `}
    >
      {children}
    </main>
  );
}
