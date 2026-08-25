'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Bell, ShieldAlert, Mail, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/page-header';

type PreferenceKey = 'notifyNewSubscriber' | 'notifyFailedLogin' | 'notifyPendingReview';

interface NotificationOption {
  key: PreferenceKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    key: 'notifyNewSubscriber',
    title: 'New Newsletter Subscriber',
    description: 'Get notified when a citizen subscribes to the public newsletter.',
    icon: <Mail className="w-5 h-5" />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },

  {
    key: 'notifyPendingReview',
    title: 'Pending Content Review',
    description: 'Notify me when a post is marked as draft and awaits final approval.',
    icon: <FileText className="w-5 h-5" />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    key: 'notifyFailedLogin',
    title: 'Failed Admin Login Attempts',
    description: 'Security alert for multiple failed logins to the KFD admin panel.',
    icon: <ShieldAlert className="w-5 h-5" />,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
];

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  // Notification Preferences State
  const [preferences, setPreferences] = useState<Record<PreferenceKey, boolean>>({
    notifyNewSubscriber: true,
    notifyFailedLogin: true,
    notifyPendingReview: true,
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kfd_admin_notification_settings');
    if (saved) {
      try {
        setPreferences(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
    setLoading(false);
  }, []);

  const handleToggle = (key: PreferenceKey) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);

    // Auto-save immediately
    localStorage.setItem('kfd_admin_notification_settings', JSON.stringify(updated));

    // Show subtle saved indicator
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1500);

    // Show toast
    const option = NOTIFICATION_OPTIONS.find(o => o.key === key);
    if (option) {
      toast.success(
        updated[key]
          ? `${option.title} enabled`
          : `${option.title} disabled`,
        { duration: 2000 }
      );
    }
  };

  if (loading) {
    return <div className="p-8 text-steel">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-ink font-medium">System Settings</span>
      </div>

      <PageHeader
        icon={Settings}
        title="System Settings"
        description="Manage your personal dashboard preferences and notification alerts."
      />

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6">

        {/* Notification Settings Panel */}
        <div className="bg-canvas rounded-lg border border-hairline overflow-hidden shadow-sm">
          <div className="p-6 border-b border-hairline-soft bg-surface-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-steel" />
              <div>
                <h2 className="text-lg font-bold text-ink">Notification Alerts</h2>
                <p className="text-sm text-steel">Choose which events trigger an alert on your dashboard.</p>
              </div>
            </div>
            <span className="text-xs font-medium text-brand-green-dark bg-brand-green-soft px-3 py-1 rounded-full border border-brand-green/20">
              Auto-saved
            </span>
          </div>

          <div className="p-6 space-y-1">
            {NOTIFICATION_OPTIONS.map((option, index) => (
              <React.Fragment key={option.key}>
                {index > 0 && <hr className="border-hairline-soft !my-0" />}
                <div className="flex items-center justify-between py-4 group">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full ${option.iconBg} flex items-center justify-center ${option.iconColor} shrink-0 transition-transform group-hover:scale-105`}>
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-ink">{option.title}</h3>
                      <p className="text-sm text-steel mt-0.5">{option.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Saved micro-animation */}
                    <span
                      className={`text-xs font-medium text-brand-green-dark flex items-center gap-1 transition-all duration-300 ${
                        savedKey === option.key
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 translate-x-2'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      Saved
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={preferences[option.key]}
                        onChange={() => handleToggle(option.key)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-canvas after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                    </label>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
