import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { SidebarProvider } from '@/components/sidebar-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        {/* Main content area offset by the sidebar width on desktop */}
        <main className="md:ml-[220px] flex-1 p-4 md:p-8 w-full overflow-x-hidden">
          <Header />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
