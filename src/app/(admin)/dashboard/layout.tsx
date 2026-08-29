import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { SidebarProvider } from '@/components/sidebar-context';
import DashboardLayoutWrapper from '@/components/dashboard-layout-wrapper';
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
      {/* Previously only the public site had this; the admin dashboard had no
          way to bypass the sidebar's ~20 nav links on every page load. */}
      <a
        href="#main-content"
        className="absolute top-0 left-0 -translate-y-full focus:translate-y-0 bg-brand-green text-on-primary font-bold px-4 py-3 z-[100] transition-transform focus:outline-none focus:ring-4 focus:ring-brand-green-dark"
      >
        Skip to main content
      </a>
      <div className="flex min-h-screen bg-surface">
        <Sidebar initialOrgIdentity={siteIdentity} />
        <DashboardLayoutWrapper header={<Header />}>
          {children}
        </DashboardLayoutWrapper>
      </div>
      {/* No Toaster here — the root layout mounts the single app-wide one.
          A second one meant admin actions popped a toast in two corners. */}
    </SidebarProvider>
  );
}
