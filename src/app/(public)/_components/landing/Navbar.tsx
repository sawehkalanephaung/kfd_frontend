import Link from "next/link";
import { Search, Trees } from "lucide-react";

export default function Navbar() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Departments", href: "/departments" },
    { name: "Projects", href: "/projects" },
    { name: "News", href: "/news" },
    { name: "Resources", href: "/resources" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-[#1a3626] text-white p-2 rounded-md">
            <Trees size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none text-[#1a3626] tracking-tight">KFD</span>
            <span className="text-xs text-gray-500 font-medium">Kawthoolei Forestry Department</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-[#1a3626] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="text-gray-600 hover:text-[#1a3626] transition-colors" aria-label="Search">
            <Search size={20} />
          </button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-[#1a3626] bg-green-50 px-2 py-1 rounded">EN</span>
          </div>
        </div>
      </div>
    </header>
  );
}
