import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { SidebarProvider } from '@/components/sidebar-context';
import DashboardLayoutWrapper from '@/components/dashboard-layout-wrapper';
import { Toaster } from 'sonner';
import { getSiteIdentity } from '@/lib/site-identity';

/**
 * Fetches site identity server-side (same source and FALLBACK-on-failure
 * behavior as the public Navbar/Footer) so the sidebar renders the real
 * org name/logo on the very first paint. Sidebar itself is a client
 * component that previously started from hardcoded defaults and only
 * fetched the real branding after mount — every hard reload flashed the
 * placeholder logo/name until that fetch resolved.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteIdentity = await getSiteIdentity();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-surface">
        <Sidebar initialOrgIdentity={siteIdentity} />
        <DashboardLayoutWrapper>
          <Header />
          {children}
        </DashboardLayoutWrapper>
      </div>
      <Toaster position="bottom-right" richColors />
    </SidebarProvider>
  );
}
