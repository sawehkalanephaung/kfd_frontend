'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

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
    label: 'KFD Organization',
    icon: <Building2 className="w-5 h-5" />,
    href: '/dashboard/organization',
    subItems: [
      { label: 'Departments', href: '/dashboard/organization/departments' },
      { label: 'Global Metrics', href: '/dashboard/organization/metrics' },
    ],
  },
  {
    label: 'Pages',
    icon: <FileText className="w-5 h-5" />,
    href: '/dashboard/pages',
    subItems: [
      { label: 'All Pages', href: '/dashboard/pages' },
      { label: 'Create Page', href: '/dashboard/pages/create' },
      { label: 'FAQs', href: '/dashboard/pages/faqs' },
    ],
  },
  {
    label: 'Posts & News',
    icon: <PenLine className="w-5 h-5" />,
    href: '/dashboard/posts',
    subItems: [
      { label: 'All Posts', href: '/dashboard/posts' },
      { label: 'Create Post', href: '/dashboard/posts/create' },
      { label: 'Categories', href: '/dashboard/posts/categories' },
      { label: 'Tags', href: '/dashboard/posts/tags' },
    ],
  },
  {
    label: 'Media & Resources',
    icon: <FolderOpen className="w-5 h-5" />,
    href: '/dashboard/media',
    subItems: [
      { label: 'Library', href: '/dashboard/media' },
      { label: 'Upload', href: '/dashboard/media/upload' },
    ],
  },
  {
    label: 'Team Directory',
    icon: <Users className="w-5 h-5" />,
    href: '/dashboard/team',
    subItems: [
      { label: 'Members', href: '/dashboard/team' },
      { label: 'System Users', href: '/dashboard/team/users' },
      { label: 'Roles & Access', href: '/dashboard/team/roles' },
    ],
  },
  {
    label: 'System Settings',
    icon: <Settings className="w-5 h-5" />,
    href: '/dashboard/settings',
    subItems: [
      { label: 'General', href: '/dashboard/settings' },
      { label: 'Global Contact Info', href: '/dashboard/settings/contact' },
      { label: 'Security', href: '/dashboard/settings/security' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-[220px] flex flex-col bg-white border-r border-gray-100 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-wide leading-none">
            K F D
          </h1>
          <span className="text-[11px] text-gray-400 font-medium">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const expanded = expandedMenus.includes(item.label);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.label}>
              {/* Main menu item */}
              {hasSubItems ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`
                    w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <ChevronUp
                    className={`w-4 h-4 transition-transform duration-200 ${
                      expanded ? '' : 'rotate-180'
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}

              {/* Sub-items */}
              {hasSubItems && (
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    expanded ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="ml-6 pl-4 border-l-2 border-gray-100 space-y-0.5">
                    {item.subItems!.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`
                          block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                          ${
                            pathname === sub.href
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                          }
                        `}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
