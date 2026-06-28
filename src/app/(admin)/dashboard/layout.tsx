import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { SidebarProvider } from '@/components/sidebar-context';
import DashboardLayoutWrapper from '@/components/dashboard-layout-wrapper';
import { Toaster } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <DashboardLayoutWrapper>
          <Header />
          {children}
        </DashboardLayoutWrapper>
      </div>
      <Toaster position="bottom-right" richColors />
    </SidebarProvider>
  );
}
