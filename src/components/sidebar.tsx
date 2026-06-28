'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import logoImg from "@/assets/logo-2.png";
import {
  LayoutDashboard,
  Building2,
  FileText,
  PenLine,
  FolderOpen,
  Users,
  Settings,
  ChevronUp,
  LogOut,
  Leaf,
  X,
  Shield,
  Layers
} from 'lucide-react';
import { useSidebar } from '@/components/sidebar-context';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  subItems?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/dashboard',
  },
  {
    label: 'Content',
    icon: <Layers className="w-5 h-5" />,
    href: '/dashboard/content-management', // This acts as a grouping identifier for active state
    subItems: [
      { label: 'All Pages', href: '/dashboard/pages' },
      { label: 'FAQs', href: '/dashboard/pages/faqs' },
      { label: 'All Posts', href: '/dashboard/posts' },
      { label: 'Categories', href: '/dashboard/posts/categories' },
      { label: 'Tags', href: '/dashboard/posts/tags' },
      { label: 'Resources (Library)', href: '/dashboard/media' },
      { label: ' Newsletter Subscribers', href: '/dashboard/newsletter' },
    ],
  },
  {
    label: 'Organization',
    icon: <Building2 className="w-5 h-5" />,
    href: '/dashboard/org-management', // Grouping identifier
    subItems: [
      { label: 'Departments', href: '/dashboard/organization/departments' },
      { label: 'Team Members', href: '/dashboard/team' },
      { label: 'Global Contact Info', href: '/dashboard/contact' },
      { label: 'Global Metrics', href: '/dashboard/organization/metrics' },
    ],
  },
  {
    label: 'Administration',
    icon: <Shield className="w-5 h-5" />,
    href: '/dashboard/admin-access', // Grouping identifier
    subItems: [
      { label: 'System Users', href: '/dashboard/team/users' },
      { label: 'Roles & Access', href: '/dashboard/team/roles' },
      { label: 'System Settings', href: '/dashboard/settings' },
    ],
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { isOpen, setIsOpen, isCollapsed } = useSidebar();

  const handleLogout = () => {
    // Clear JWT token
    localStorage.removeItem('token');
    // Clear all admin-specific cached state for security
    localStorage.removeItem('kfd_dismissed_notifs');
    localStorage.removeItem('kfd_admin_notification_settings');
    // Redirect to login
    router.push('/login');
  };


  // Auto-expand the section that contains the current route.
  // Runs only on the client to avoid SSR/hydration mismatch.
  useEffect(() => {
    const active = menuItems
      .filter(
        (item) =>
          item.subItems?.some((sub) =>
            sub.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(sub.href)
          )
      )
      .map((item) => item.label);
    setExpandedMenus(active);
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (item: MenuItem) => {
    if (item.href === '/dashboard') return pathname === '/dashboard';

    const checkPath = (href: string) => {
      // Special case for Team Members to prevent it from highlighting when on Users or Roles
      if (href === '/dashboard/team') {
        return pathname === '/dashboard/team' ||
          (pathname.startsWith('/dashboard/team/') &&
            !pathname.startsWith('/dashboard/team/users') &&
            !pathname.startsWith('/dashboard/team/roles'));
      }
      return pathname === href || pathname.startsWith(href + '/');
    };

    // If it has subitems, it's active if the current pathname matches any subitem's href
    if (item.subItems) {
      return item.subItems.some(sub => checkPath(sub.href));
    }

    return checkPath(item.href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen flex flex-col bg-white border-r border-gray-100 shadow-xl md:shadow-sm transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'}
          ${!isOpen && isCollapsed ? 'md:w-[80px]' : 'md:w-[280px]'}
        `}
      >
        {/* Header / Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'} py-6 min-h-[88px]`}>
          <div className="flex items-center gap-3">
            <div className={`relative w-10 h-10 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
              <Image
                src={logoImg}
                alt="KFD Logo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-[13px] font-bold text-gray-900 tracking-tight leading-tight truncate">
                  Kawthoolei Forestry Department
                </h1>
                <span className="text-[11px] text-gray-600 font-medium mt-0.5 truncate">
                  သ့ၣ်ပှၢ်ဝဲၤကျိၤ
                </span>
              </div>
            )}
          </div>
          {/* Mobile Close Button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-2 -mr-2 text-gray-400 hover:text-gray-900 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 px-3 pb-4 space-y-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
          {menuItems.map((item) => {
            const active = isActive(item);
            const expanded = expandedMenus.includes(item.label);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.label} className="relative group">
                {/* Main menu item */}
                {hasSubItems ? (
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={
                      `w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'} ` +
                      (active
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                      <div className="flex-shrink-0">{item.icon}</div>
                      {!isCollapsed && <span className="text-left truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronUp
                        className={`w-4 h-4 transition-transform duration-200 ${expanded ? '' : 'rotate-180'
                          }`}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={
                      `flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : 'px-4'} ` +
                      (active
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {!isCollapsed && <span className="text-left truncate">{item.label}</span>}
                  </Link>
                )}

                {/* Sub-items (Expanded Mode) */}
                {!isCollapsed && hasSubItems && (
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${expanded ? 'max-h-80 opacity-100 mt-1' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="ml-6 pl-4 border-l-2 border-gray-100 space-y-0.5">
                      {item.subItems!.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setIsOpen(false)}
                          className={
                            "block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors " +
                            (pathname === sub.href
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50")
                          }
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-items (Collapsed Flyout Mode) */}
                {isCollapsed && hasSubItems && (
                  <div className="hidden group-hover:block absolute left-full top-0 pl-3 w-56 z-[100]">
                    <div className="bg-white shadow-xl rounded-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="px-4 py-2 text-sm font-bold text-gray-900 border-b border-gray-50 mb-1">{item.label}</div>
                      <div className="px-2">
                        {item.subItems!.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={
                              "block px-3 py-2 my-0.5 rounded-lg text-[13px] font-medium transition-colors " +
                              (pathname === sub.href
                                ? "text-emerald-600 bg-emerald-50"
                                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50")
                            }
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 py-3 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
