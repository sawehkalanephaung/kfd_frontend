'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Mail, FileText, Check, ShieldAlert } from 'lucide-react';
import { useSidebar } from '@/components/sidebar-context';
import { SidebarToggleIcon } from '@/components/ui/sidebar-toggle-icon';
import api from '@/lib/api';
import Link from 'next/link';
import GlobalCreateButton from '@/components/global-create-button';

interface NotificationItem {
  id: string;
  type: 'SUBSCRIBER' | 'POST_REVIEW' | 'FAILED_LOGIN';
  title: string;
  subtitle: string;
  date: Date;
  href: string;
}

// Notification type styling config
const NOTIF_STYLES: Record<NotificationItem['type'], { bg: string; text: string; icon: React.ReactNode }> = {
  SUBSCRIBER: {
    bg: 'bg-accent-blue/10',
    text: 'text-accent-blue',
    icon: <Mail className="w-4 h-4" />,
  },
  POST_REVIEW: {
    bg: 'bg-accent-orange/10',
    text: 'text-accent-orange',
    icon: <FileText className="w-4 h-4" />,
  },

  FAILED_LOGIN: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    icon: <ShieldAlert className="w-4 h-4" />,
  },
};

// Relative time helper
function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'yesterday';
  return `${diffDay}d ago`;
}

export default function Header() {
  const { setIsOpen, isCollapsed, setIsCollapsed } = useSidebar();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string; roles: string[] } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user info from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kfd_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse user info', e);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds for real-time feel
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      // Check user preferences to see what to alert
      let prefs = {
        notifyNewSubscriber: true,
        notifyPendingReview: true,
        notifyFailedLogin: true,
      };
      try {
        const saved = localStorage.getItem('kfd_admin_notification_settings');
        if (saved) prefs = { ...prefs, ...JSON.parse(saved) };
      } catch (e) { }

      const newNotifs: NotificationItem[] = [];
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // 1. Fetch latest newsletter subscribers
      if (prefs.notifyNewSubscriber) {
        try {
          const subRes = await api.get('/api/v1/admin/newsletter/subscribers');
          const subscribers = Array.isArray(subRes.data) ? subRes.data : [];

          // Sort by date descending and take top 3 recent
          subscribers.sort((a: any, b: any) =>
            new Date(b.subscribedAt || b.createdAt).getTime() - new Date(a.subscribedAt || a.createdAt).getTime()
          );

          subscribers.slice(0, 3).forEach((sub: any) => {
            const subDate = new Date(sub.subscribedAt || sub.createdAt);
            if (subDate >= oneDayAgo) {
              newNotifs.push({
                id: `sub-${sub.id}`,
                type: 'SUBSCRIBER',
                title: 'New Subscriber',
                subtitle: sub.email,
                date: subDate,
                href: '/dashboard/newsletter',
              });
            }
          });
        } catch (e) {
          // Silently fail for this source
        }
      }

      // 2. Fetch pending review posts (DRAFT)
      if (prefs.notifyPendingReview) {
        try {
          const postRes = await api.get('/api/v1/admin/cms/posts?status=DRAFT&size=3&sort=updatedAt,desc');
          const drafts = postRes.data?.content || [];

          drafts.forEach((post: any) => {
            newNotifs.push({
              id: `post-${post.id}`,
              type: 'POST_REVIEW',
              title: 'Pending Review',
              subtitle: post.title,
              date: new Date(post.updatedAt || post.createdAt),
              href: `/dashboard/posts/${post.id}/edit`,
            });
          });
        } catch (e) {
          // Silently fail for this source
        }
      }



      // 3. Fetch failed login attempts from the backend audit log
      if (prefs.notifyFailedLogin) {
        try {
          const auditRes = await api.get('/api/v1/admin/audit-logs?actionType=LOGIN_FAILED&size=5&sort=createdAt,desc');
          const auditPage = auditRes.data?.data || auditRes.data;
          const failedLogs = auditPage?.content || [];

          // Build a lookup map: email → userId by fetching existing users
          let usersByEmail: Record<string, string> = {};
          try {
            const userRes = await api.get('/api/v1/admin/users');
            const allUsers = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.content || userRes.data?.data?.content || userRes.data?.data || []);
            allUsers.forEach((u: any) => {
              if (u.email) usersByEmail[u.email.toLowerCase()] = u.id;
            });
          } catch (e) { }

          failedLogs.forEach((log: any) => {
            const logDate = new Date(log.createdAt);
            if (logDate >= oneDayAgo) {
              const attemptedEmail = log.entityType || 'Unknown email';
              const matchedUserId = usersByEmail[attemptedEmail.toLowerCase()];
              const isExistingUser = !!matchedUserId;

              newNotifs.push({
                id: `login-fail-${log.id}`,
                type: 'FAILED_LOGIN',
                title: isExistingUser ? 'Failed Login Attempt' : 'Unknown Email Login Attempt',
                subtitle: `${attemptedEmail} from ${log.ipAddress || 'Unknown IP'}`,
                date: logDate,
                // Link to users page with editUserId if the user exists, otherwise don't redirect
                href: isExistingUser ? `/dashboard/team/users?editUserId=${matchedUserId}` : '#',
              });
            }
          });
        } catch (e) {
          // Silently fail for this source
        }
      }

      // Filter out dismissed notifications
      const dismissedIds = JSON.parse(localStorage.getItem('kfd_dismissed_notifs') || '[]');
      const visibleNotifs = newNotifs.filter(n => !dismissedIds.includes(n.id));

      // Sort visible notifications by date descending
      visibleNotifs.sort((a, b) => b.date.getTime() - a.date.getTime());

      setNotifications(visibleNotifs);
      setHasUnread(visibleNotifs.length > 0);

    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAllAsRead = () => {
    const currentDismissed = JSON.parse(localStorage.getItem('kfd_dismissed_notifs') || '[]');
    const newDismissed = [...currentDismissed, ...notifications.map(n => n.id)];
    localStorage.setItem('kfd_dismissed_notifs', JSON.stringify(newDismissed));

    setNotifications([]);
    setHasUnread(false);
  };

  const dismissSingle = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentDismissed = JSON.parse(localStorage.getItem('kfd_dismissed_notifs') || '[]');
    localStorage.setItem('kfd_dismissed_notifs', JSON.stringify([...currentDismissed, id]));
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      setHasUnread(updated.length > 0);
      return updated;
    });
  };

  const handleDropdownClick = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="flex items-center justify-between gap-3 mt-4 mr-4 md:mt-8 md:mr-8 mb-6 md:mb-8">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button (Hidden on Desktop) */}
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
          className="md:hidden w-11 h-11 bg-canvas rounded-xl flex items-center justify-center shadow-subtle border border-hairline text-steel hover:text-brand-green-dark transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green active:scale-95"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Global Create Button (Hidden on Mobile for cleaner UI, or could be visible) */}
        <div className="hidden md:block ml-4 md:ml-8">
          <GlobalCreateButton userRoles={user?.roles || []} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search button removed because we are using individual page search bars */}

        {/* Notification Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleDropdownClick}
            aria-label={hasUnread ? `Notifications, ${notifications.length} unread` : 'Notifications'}
            aria-expanded={showDropdown}
            aria-haspopup="true"
            className={`relative w-11 h-11 bg-canvas rounded-full flex items-center justify-center shadow-subtle border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green ${showDropdown ? 'text-brand-green-dark border-brand-green-soft' : 'text-steel border-hairline hover:text-ink'}`}
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {hasUnread && (
              <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-accent-orange border-2 border-canvas rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white leading-none">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div className="absolute -right-18 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[384px] bg-canvas rounded-lg shadow-modal border border-hairline overflow-hidden z-50 origin-top-right" style={{ animation: 'slideDown 0.2s ease-out' }}>
              <div className="flex items-center justify-between p-4 border-b border-hairline-soft bg-surface-soft">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-ink">Notifications</h3>
                  {notifications.length > 0 && (
                    <span className="text-[11px] font-semibold text-on-dark bg-accent-orange rounded-full px-1.5 py-0.5 leading-none">
                      {notifications.length}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="text-xs font-medium text-brand-green-dark hover:text-brand-green-mid flex items-center gap-1 hover:bg-brand-green-soft px-2 py-1 rounded-full transition-colors">
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-100 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-5 h-5 text-muted" />
                    </div>
                    <p className="text-sm font-medium text-steel">All caught up!</p>
                    <p className="text-xs text-muted mt-1">No new notifications right now.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-hairline-soft">
                    {notifications.map(notif => {
                      const style = NOTIF_STYLES[notif.type];
                      return (
                        <Link
                          key={notif.id}
                          href={notif.href}
                          onClick={(e) => {
                            if (notif.href === '#') {
                              e.preventDefault();
                            }
                            setShowDropdown(false);
                          }}
                          className="dropdown-row-hover flex items-start gap-3 p-4 transition-all duration-200 ease-in-out group relative"
                        >
                          <div className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.text} transition-transform group-hover:scale-105`}>
                            {style.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-ink">{notif.title}</p>
                              <span className="text-[11px] text-muted shrink-0">{timeAgo(notif.date)}</span>
                            </div>
                            <p className="text-sm text-steel line-clamp-1 mt-0.5">{notif.subtitle}</p>
                          </div>
                          {/* Dismiss button */}
                          <button
                            onClick={(e) => dismissSingle(notif.id, e)}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-ink p-1 rounded-lg hover:bg-surface"
                            title="Dismiss"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-hairline-soft bg-surface-soft">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowDropdown(false)}
                    className="block text-center text-xs font-medium text-steel hover:text-brand-green-dark transition-colors"
                  >
                    Manage notification preferences
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Info (Non-clickable) */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-hairline">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-brand-green-soft border border-brand-green/20 flex items-center justify-center shrink-0">
            {/* Fallback to initials if no image is present */}
            <span className="text-brand-green-dark font-bold text-sm">
              {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-col items-start hidden sm:flex">
            <span className="text-[14px] font-semibold text-ink leading-tight">
              {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
            </span>
            <span className="text-[12px] font-medium text-brand-green-dark leading-tight mt-0.5 capitalize">
              {user?.roles?.[0]?.replace('ROLE_', '').replace('_', ' ').toLowerCase() || 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
