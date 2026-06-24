import Image from "next/image";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import logoImg from "@/assets/logo-2.png";

export default async function Navbar() {
  let departments = [];

  try {
    const deptRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/public/departments`, {
      cache: 'no-store' // Use no-store to ensure the dropdown updates immediately when admin adds/deletes departments
    });

    if (deptRes.ok) {
      const responseData = await deptRes.json();
      // Handle different possible backend response structures (Spring Data Page, wrapped in data, or direct array)
      const dataList = responseData.content || responseData.data || (Array.isArray(responseData) ? responseData : []);
      
      departments = dataList.map((dept: any) => ({
        name: dept.name,
        href: `/departments/${dept.slug}`
      }));
    }
  } catch (error) {
    console.error("Failed to fetch data for navbar", error);
  }

  const navLinks = [
    { name: "Home", href: "/" },
    {
      name: "About",
      href: "/about",
      dropdown: [
        { name: "History", href: "/about#history" },
        { name: "Mission", href: "/about#mission" },
        { name: "Vision", href: "/about#vision" },
        { name: "Objective", href: "/about#objective" },
        { name: "Chairman", href: "/about#chairman" },
      ]
    },
    {
      name: "Departments",
      href: "/departments",
      dropdown: departments.length > 0 ? departments : undefined
    },
    { name: "News", href: "/news" },
    { name: "Resources", href: "/resources" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={logoImg}
              alt="KFD Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none text-[#1a3626] tracking-tight">Kawthoolei Forestry Department</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              <Link
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-[#1a3626] transition-colors flex items-center gap-1 py-4"
              >
                {link.name}
                {link.dropdown && <ChevronDown size={14} className="text-gray-400 group-hover:text-[#1a3626] transition-colors" />}
              </Link>

              {link.dropdown && (
                <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-lg rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-left -translate-y-2 group-hover:translate-y-0">
                  <div className="py-2">
                    {link.dropdown.map((subLink: any) => (
                      <Link
                        key={subLink.name}
                        href={subLink.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-[#1a3626] transition-colors"
                      >
                        {subLink.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
