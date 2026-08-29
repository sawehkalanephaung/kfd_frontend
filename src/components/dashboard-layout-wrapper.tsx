'use client';

import React, { useEffect, useState } from 'react';
import { useSidebar } from '@/components/sidebar-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardLayoutWrapper({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if running in browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  // Prevent flashing of dashboard content before redirecting
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center text-brand-green">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-steel font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={`
        flex-1 w-full overflow-x-hidden transition-all duration-300 ease-in-out bg-surface
        ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'}
      `}
    >
      {header}
      {/* Previously <Header/> was rendered *inside* this element when it was
          itself a <main>, which strips <header>'s implicit "banner" landmark
          role (only granted when it isn't a descendant of main/article/etc).
          header and main are now siblings, and main is the skip-link target
          from dashboard/layout.tsx. */}
      <main id="main-content" tabIndex={-1} className="p-4 md:p-8 outline-none">
        {children}
      </main>
    </div>
  );
}
