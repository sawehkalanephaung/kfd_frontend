'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import logoImg from "@/assets/logo-2.png";
import api, { getMediaUrl } from '@/lib/api';
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
import { SITE_IDENTITY_UPDATED_EVENT, type SiteIdentity } from '@/lib/site-identity';

interface OrgIdentityDisplay {
  organizationName: string;
  organizationNameKaren: string | null;
  resolvedLogoUrl: string | null;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  subItems?: { label: string; href: string; allowedRoles?: string[] }[];
  allowedRoles?: string[];
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
    allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'],
    subItems: [
      { label: 'All Pages', href: '/dashboard/pages', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
      { label: 'FAQs', href: '/dashboard/pages/faqs', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
      { label: 'All Posts', href: '/dashboard/posts', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
      { label: 'Categories', href: '/dashboard/posts/categories', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
      { label: 'Tags', href: '/dashboard/posts/tags', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
      { label: 'All Publications', href: '/dashboard/publications', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
      { label: 'Publication Categories', href: '/dashboard/publications/categories', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
      { label: 'Resources (Library)', href: '/dashboard/media', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
      { label: 'Newsletter Subscribers', href: '/dashboard/newsletter', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Organization',
    icon: <Building2 className="w-5 h-5" />,
    href: '/dashboard/org-management', // Grouping identifier
    allowedRoles: ['manage_content', 'manage_settings', 'view_analytics', 'ROLE_SUPER_ADMIN'],
    subItems: [
      { label: 'Organization Identity', href: '/dashboard/organization/identity', allowedRoles: ['manage_settings', 'ROLE_SUPER_ADMIN'] },
      { label: 'Department Branches', href: '/dashboard/organization/departments', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
      { label: 'Chairman', href: '/dashboard/team', allowedRoles: ['manage_content', 'ROLE_SUPER_ADMIN'] },
      { label: 'Contact', href: '/dashboard/contact', allowedRoles: ['manage_settings', 'ROLE_SUPER_ADMIN'] },
      { label: 'Statistics Metrics', href: '/dashboard/organization/metrics', allowedRoles: ['view_analytics', 'ROLE_SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Administration',
    icon: <Shield className="w-5 h-5" />,
    href: '/dashboard/admin-access', // Grouping identifier
    allowedRoles: ['manage_users', 'manage_settings', 'ROLE_SUPER_ADMIN'],
    subItems: [
      { label: 'Accounts', href: '/dashboard/team/users', allowedRoles: ['manage_users', 'ROLE_SUPER_ADMIN'] },
      { label: 'Roles & Access', href: '/dashboard/team/roles', allowedRoles: ['manage_users', 'ROLE_SUPER_ADMIN'] },
      { label: 'Settings', href: '/dashboard/settings', allowedRoles: ['manage_settings', 'ROLE_SUPER_ADMIN'] },
    ],
  }
];

export default function Sidebar({ initialOrgIdentity }: { initialOrgIdentity?: SiteIdentity }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { isOpen, setIsOpen, isCollapsed } = useSidebar();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [orgIdentity, setOrgIdentity] = useState<OrgIdentityDisplay | null>(
    initialOrgIdentity
      ? {
        organizationName: initialOrgIdentity.organizationName,
        organizationNameKaren: initialOrgIdentity.organizationNameKaren,
        resolvedLogoUrl: initialOrgIdentity.resolvedLogoUrl,
      }
      : null
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kfd_user');
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUserRoles(parsedUser.roles || []);
      }
    } catch (e) {
      console.error('Failed to parse user info', e);
    }
  }, []);

  // Branding shown here comes from the same admin-managed site identity as the
  // public site, seeded from `initialOrgIdentity` (fetched server-side by the
  // layout) so the first paint is already correct. This effect only needs to
  // run again after a save on the identity page (via the event listener) —
  // it deliberately does NOT run unconditionally on mount, which would
  // re-flash stale defaults while the request is in flight.
  useEffect(() => {
    const fetchIdentity = () => {
      api.get('/api/v1/public/site-identity')
        .then((res) => {
          // The public endpoint returns the DTO directly, but tolerate a wrapped shape
          // (matches the unwrap in src/lib/site-identity.ts).
          const identity = res.data?.data ?? res.data;
          if (!identity?.organizationName) return;
          setOrgIdentity({
            organizationName: identity.organizationName,
            organizationNameKaren: identity.organizationNameKaren ?? null,
            resolvedLogoUrl: identity.logoUrl ? getMediaUrl(identity.logoUrl) : null,
          });
        })
        .catch((e) => console.error('Failed to load site identity', e));
    };
    if (!initialOrgIdentity) fetchIdentity();
    window.addEventListener(SITE_IDENTITY_UPDATED_EVENT, fetchIdentity);
    return () => window.removeEventListener(SITE_IDENTITY_UPDATED_EVENT, fetchIdentity);
  }, [initialOrgIdentity]);

  const displayName = orgIdentity?.organizationName || 'Kawthoolei Forestry Department';
  const displayNameKaren = orgIdentity?.organizationNameKaren ?? 'ကီၢ်သူလ့ၤသ့ၣ်ပှၢ်ဝဲၤကျိၤ';
  const resolvedLogoUrl = orgIdentity?.resolvedLogoUrl ?? null;

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
    const checkPath = (href: string) => {
      if (href === '/dashboard/team') {
        return pathname === '/dashboard/team' ||
          (pathname.startsWith('/dashboard/team/') &&
            !pathname.startsWith('/dashboard/team/users') &&
            !pathname.startsWith('/dashboard/team/roles'));
      }
      return pathname === href || pathname.startsWith(href + '/');
    };

    const activeItem = menuItems.find(item => {
      if (item.href === '/dashboard') return pathname === '/dashboard';
      if (item.subItems) {
        return item.subItems.some(sub => checkPath(sub.href));
      }
      return checkPath(item.href);
    });

    if (activeItem) {
      setExpandedMenus((prev) =>
        prev.includes(activeItem.label) ? prev : [...prev, activeItem.label]
      );
    }
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
      // Special case for Chairman to prevent it from highlighting when on Users or Roles
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

  // Filter menu items based on user roles
  const filteredMenuItems = menuItems.filter(item => {
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      const hasAccess = item.allowedRoles.some(role => userRoles.includes(role));
      if (!hasAccess) return false;
    }
    return true;
  }).map(item => {
    // Also filter subItems
    if (item.subItems) {
      return {
        ...item,
        subItems: item.subItems.filter(sub => {
          if (sub.allowedRoles && sub.allowedRoles.length > 0) {
            return sub.allowedRoles.some(role => userRoles.includes(role));
          }
          return true;
        })
      };
    }
    return item;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container — MongoDB brand-teal-deep */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen flex flex-col bg-teal-deep transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0'}
          ${!isOpen && isCollapsed ? 'md:w-[80px]' : 'md:w-[280px]'}
        `}
      >
        {/* Header / Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'} py-6 min-h-[88px] min-w-0`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`relative w-10 h-10 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
              {resolvedLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolvedLogoUrl}
                  alt={`${displayName} Logo`}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <Image
                  src={logoImg}
                  alt={`${displayName} Logo`}
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <h1 className="text-[13px] font-bold text-on-dark tracking-tight leading-tight truncate">
                  {displayName}
                </h1>
                {displayNameKaren && (
                  <span className="text-[11px] text-on-dark-muted font-medium mt-0.5 truncate">
                    {displayNameKaren}
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Mobile Close Button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-2 -mr-2 text-on-dark-muted hover:text-on-dark rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 px-3 pb-4 space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
          {filteredMenuItems.map((item) => {
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
                      `w-full flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'} min-w-0 ` +
                      (active
                        ? "bg-brand-green text-on-primary shadow-lg shadow-brand-green/20"
                        : "text-on-dark-muted hover:bg-canvas/8 hover:text-on-dark")
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                      <div className="flex-shrink-0 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-300">{item.icon}</div>
                      {!isCollapsed && <span className="text-left truncate group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronUp
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${expanded ? '' : 'rotate-180'}`}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={
                      `flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-w-0 ${isCollapsed ? 'justify-center px-0' : 'px-4'} ` +
                      (active
                        ? "bg-brand-green text-on-primary shadow-lg shadow-brand-green/20"
                        : "text-on-dark-muted hover:bg-canvas/8 hover:text-on-dark")
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex-shrink-0 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-300">{item.icon}</div>
                    {!isCollapsed && <span className="text-left truncate group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>}
                  </Link>
                )}

                {/* Sub-items (Expanded Mode) */}
                {!isCollapsed && hasSubItems && (
                  <div
                    className={`grid transition-all duration-200 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-[22px] pl-4 border-l-[1.5px] border-white/15 space-y-0.5 my-1">
                        {item.subItems!.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setIsOpen(false)}
                            className={
                              "block px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 truncate " +
                              (pathname === sub.href
                                ? "text-brand-green bg-canvas/10 font-semibold"
                                : "text-on-dark-muted hover:text-on-dark hover:bg-canvas/5 hover:translate-x-1")
                            }
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-items (Collapsed Flyout Mode) */}
                {isCollapsed && hasSubItems && (
                  <div className="hidden group-hover:block absolute left-full top-0 pl-3 w-56 z-[100]">
                    <div className="bg-teal-deep shadow-modal rounded-lg border border-hairline-dark py-2 animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="px-4 py-2 text-sm font-bold text-on-dark border-b border-white/10 mb-1">{item.label}</div>
                      <div className="px-2">
                        {item.subItems!.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={
                              "block px-3 py-2 my-0.5 rounded-lg text-[13px] font-medium transition-colors " +
                              (pathname === sub.href
                                ? "text-brand-green bg-canvas/10"
                                : "text-on-dark-muted hover:text-on-dark hover:bg-canvas/5")
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
            className={`flex items-center gap-3 py-3 w-full rounded-lg text-sm font-medium text-on-dark-muted hover:bg-red-500/15 hover:text-red-400 transition-all duration-200 group ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            {!isCollapsed && <span className="group-hover:translate-x-1 transition-transform duration-300">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
