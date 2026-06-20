import Sidebar from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />
      {/* Main content area offset by the sidebar width */}
      <main className="ml-[220px] flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
