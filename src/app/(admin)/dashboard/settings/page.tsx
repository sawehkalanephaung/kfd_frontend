'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Bell, Save, ShieldAlert, Users, Mail, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  
  // Notification Preferences State
  const [preferences, setPreferences] = useState({
    notifyNewSubscriber: true,
    notifyNewUser: true,
    notifyFailedLogin: true,
    notifyPendingReview: true
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kfd_admin_notification_settings');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
    setLoading(false);
  }, []);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    localStorage.setItem('kfd_admin_notification_settings', JSON.stringify(preferences));
    toast.success('Notification preferences saved successfully!');
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">System Settings</span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-6 h-6 text-emerald-500" />
            System Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your personal dashboard preferences and notification alerts.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Notification Settings Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Notification Alerts</h2>
              <p className="text-sm text-gray-500">Choose which events trigger an alert on your dashboard.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            
            {/* Setting Item */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">New Newsletter Subscriber</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Get notified when a citizen subscribes to the public newsletter.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.notifyNewSubscriber}
                  onChange={() => handleToggle('notifyNewSubscriber')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <hr className="border-gray-50" />

            {/* Setting Item */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">New System User Created</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Alert me when a new admin or manager account is added.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.notifyNewUser}
                  onChange={() => handleToggle('notifyNewUser')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <hr className="border-gray-50" />

            {/* Setting Item */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Pending Content Review</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Notify me when a post is marked as draft and awaits final approval.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.notifyPendingReview}
                  onChange={() => handleToggle('notifyPendingReview')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <hr className="border-gray-50" />

            {/* Setting Item */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Failed Admin Login Attempts</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Security alert for multiple failed logins to the KFD admin panel.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.notifyFailedLogin}
                  onChange={() => handleToggle('notifyFailedLogin')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
