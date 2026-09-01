import Navbar from "./_components/landing/Navbar";
import Footer from "./_components/landing/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <a 
        href="#main-content" 
        className="absolute top-0 left-0 -translate-y-full focus:translate-y-0 bg-primary text-on-primary font-bold px-4 py-3 z-[100] transition-transform focus:outline-none focus:ring-4 focus:ring-primary"
      >
        Skip to main content
      </a>
      <div className="print:hidden"><Navbar /></div>
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>{children}</main>
      <div className="print:hidden"><Footer /></div>
    </div>
  );
}
