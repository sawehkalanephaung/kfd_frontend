import Image from "next/image";
import Link from "next/link";
import logoImg from "@/assets/logo-2.png";
import MobileMenu from "./MobileMenu";
import { NavDropdown } from "./NavDropdown";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getSiteIdentity } from "@/lib/site-identity";

export default async function Navbar() {
  const { organizationName, organizationNameKaren, resolvedLogoUrl } = await getSiteIdentity();
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
      name: "About Us",
      href: "/about",
      dropdown: [
        { name: "About KFD", href: "/about" },
        { name: "Our Chairman", href: "/team" },
      ]
    },
    {
      name: "Department Branches",
      href: "/departments",
      dropdown: departments.length > 0 ? departments : undefined
    },
    {
      name: "News",
      href: "/news",
      dropdown: [
        { name: "Latest News", href: "/news" },
        { name: "Official Announcements", href: "/news/announcements" },
        { name: "Upcoming Events", href: "/news/events" },
      ]
    },
    { name: "Resources", href: "/resources" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-canvas border-b border-hairline shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            {resolvedLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedLogoUrl}
                alt={`${organizationName} Logo`}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <Image
                src={logoImg}
                alt={`${organizationName} Logo`}
                fill
                sizes="48px"
                className="object-contain"
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none text-brand-text tracking-tight">{organizationName}</span>
            {organizationNameKaren && (
              <span lang="ksw" className="font-medium text-sm mt-1 text-brand-text">{organizationNameKaren}</span>
            )}
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) =>
            link.dropdown ? (
              <NavDropdown key={link.name} name={link.name} href={link.href} items={link.dropdown} />
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className="interactive-link text-sm font-medium py-4"
              >
                {link.name}
              </Link>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <LanguageSwitcher />

          {/* Mobile Menu */}
          <MobileMenu navLinks={navLinks} />
        </div>
      </div>
    </header>
  );
}
