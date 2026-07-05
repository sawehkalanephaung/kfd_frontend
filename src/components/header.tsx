'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Mail, FileText, Check } from 'lucide-react';
import { useSidebar } from '@/components/sidebar-context';
import api from '@/lib/api';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  type: 'SUBSCRIBER' | 'POST_REVIEW';
  title: string;
  subtitle: string;
  date: Date;
  href: string;
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
      let prefs = { notifyNewSubscriber: true, notifyPendingReview: true };
      try {
        const saved = localStorage.getItem('kfd_admin_notification_settings');
        if (saved) prefs = { ...prefs, ...JSON.parse(saved) };
      } catch (e) {}

      const newNotifs: NotificationItem[] = [];

      // Fetch latest newsletter subscribers
      if (prefs.notifyNewSubscriber) {
        const subRes = await api.get('/api/v1/admin/newsletter/subscribers').catch(() => ({ data: [] }));
        const subscribers = Array.isArray(subRes.data) ? subRes.data : [];
        
        // Sort by date descending and take top 3 latest
        subscribers.sort((a: any, b: any) => new Date(b.subscribedAt || b.createdAt).getTime() - new Date(a.subscribedAt || a.createdAt).getTime());
        
        subscribers.slice(0, 3).forEach((sub: any) => {
          // Only show subscribers from the last 24 hours
          const subDate = new Date(sub.subscribedAt || sub.createdAt);
          const isRecent = (new Date().getTime() - subDate.getTime()) < 24 * 60 * 60 * 1000;
          if (isRecent) {
            newNotifs.push({
              id: `sub-${sub.id}`,
              type: 'SUBSCRIBER',
              title: 'New Subscriber',
              subtitle: sub.email,
              date: subDate,
              href: '/dashboard/newsletter'
            });
          }
        });
      }

      // Fetch pending review posts (DRAFT)
      if (prefs.notifyPendingReview) {
        const postRes = await api.get('/api/v1/admin/cms/posts?status=DRAFT&size=3&sort=updatedAt,desc').catch(() => ({ data: { content: [] } }));
        const drafts = postRes.data?.content || [];
        
        drafts.forEach((post: any) => {
          newNotifs.push({
            id: `post-${post.id}`,
            type: 'POST_REVIEW',
            title: 'Pending Review',
            subtitle: post.title,
            date: new Date(post.updatedAt || post.createdAt),
            href: `/dashboard/posts/${post.id}/edit`
          });
        });
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

  const handleDropdownClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && hasUnread) {
      markAllAsRead();
    }
  };

  return (
    <header className="flex items-center justify-between md:justify-end gap-3 mb-6 md:mb-8">
      {/* Menu Button (Mobile Open / Desktop Collapse) */}
      <button 
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsOpen(true);
          } else {
            setIsCollapsed(!isCollapsed);
          }
        }}
        className="mr-auto w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-gray-700 hover:text-emerald-600 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3">
        {/* Search button removed because we are using individual page search bars */}

        {/* Notification Button */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleDropdownClick}
            className={`relative w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 transition-colors ${showDropdown ? 'text-emerald-600 border-emerald-200' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No new notifications right now.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.map(notif => (
                      <Link 
                        key={notif.id} 
                        href={notif.href}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'SUBSCRIBER' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                          {notif.type === 'SUBSCRIBER' ? <Mail className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{notif.subtitle}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Info (Non-clickable) */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200/60">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            {/* Fallback to initials if no image is present */}
            <span className="text-emerald-700 font-bold text-sm">
              {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex flex-col items-start hidden sm:flex">
            <span className="text-[14px] font-semibold text-gray-900 leading-tight">
              {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
            </span>
            <span className="text-[12px] font-medium text-emerald-600 leading-tight mt-0.5 capitalize">
              {user?.roles?.[0]?.replace('ROLE_', '').replace('_', ' ').toLowerCase() || 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
