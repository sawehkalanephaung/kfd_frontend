'use client';

import React, { useEffect, useState } from 'react';
import { useSidebar } from '@/components/sidebar-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
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
      <div className="flex h-screen w-full items-center justify-center bg-[#f5f6fa]">
        <div className="flex flex-col items-center text-emerald-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }
  
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
