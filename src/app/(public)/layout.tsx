import Navbar from "./_components/landing/Navbar";
import Footer from "./_components/landing/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="print:hidden"><Navbar /></div>
      <main className="flex-1">{children}</main>
      <div className="print:hidden"><Footer /></div>
    </div>
  );
}
