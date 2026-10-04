'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, UploadCloud, UserPlus, FileText, CheckCircle2, Clock, Loader2, Users, Image as ImageIcon, Building2, LayoutDashboard } from 'lucide-react';
import { TopPostsChart } from '@/components/admin/dashboard/top-posts-chart';
import { ContentCalendar } from '@/components/admin/dashboard/content-calendar';
import CountUp from '@/components/ui/count-up';
import { StatusDropdown, type StatusOption } from '@/components/ui/status-dropdown';
import api from '@/lib/api';
import { useDocumentTitle } from '@/lib/use-document-title';
import { updatePostStatus } from '@/lib/cms-status';
import toast from 'react-hot-toast';

const DASH_STATUS_OPTIONS: StatusOption[] = [
  { value: 'PUBLISHED', label: 'Published', tone: 'success' },
  { value: 'DRAFT', label: 'Draft', tone: 'warning' },
  { value: 'ARCHIVED', label: 'Archived', tone: 'neutral' },
];

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('Admin');
  const [greeting, setGreeting] = useState('Welcome');
  const [today, setToday] = useState('');

  const [stats, setStats] = useState({
    posts: 0,
    drafts: 0,
    archived: 0,
    teamMembers: 0,
    media: 0,
    departments: 0,
  });

  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [calendarPosts, setCalendarPosts] = useState<any[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Set on the client so the server-rendered HTML can't disagree with the
    // reader's local date.
    setToday(
      new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    );

    try {
      const stored = localStorage.getItem('kfd_user');
      if (stored) {
        const parsedUser = JSON.parse(stored);
        const fullName = `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim();
        if (fullName) {
          setName(fullName);
        } else if (parsedUser.name || parsedUser.username) {
          setName(parsedUser.name || parsedUser.username);
        }
      }
    } catch (e) {
      console.error('Failed to parse user info', e);
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all necessary data in parallel
        // Fetch all necessary data in parallel using allSettled to prevent one 403 from failing the whole dashboard
        const results = await Promise.allSettled([
          api.get('/api/v1/admin/cms/posts?status=PUBLISHED&size=1'),
          api.get('/api/v1/admin/cms/posts?status=DRAFT&size=1'),
          api.get('/api/v1/admin/cms/posts?status=ARCHIVED&size=1'),
          api.get('/api/v1/admin/team-members?size=1'),
          api.get('/api/v1/admin/media?size=1'),
          api.get('/api/v1/admin/departments?size=1'),
          api.get('/api/v1/admin/cms/posts?size=5&sort=updatedAt,desc'),
          api.get('/api/v1/admin/cms/posts?size=5&sort=viewCount,desc'),
          api.get('/api/v1/admin/cms/posts?size=100&sort=updatedAt,desc')
        ]);

        const getValue = (index: number) => {
          const res = results[index];
          return res.status === 'fulfilled' ? res.value : null;
        };

        const publishedPostsRes = getValue(0);
        const draftPostsRes = getValue(1);
        const archivedPostsRes = getValue(2);
        const teamRes = getValue(3);
        const mediaRes = getValue(4);
        const deptRes = getValue(5);
        const recentActivityRes = getValue(6);
        const topPostsRes = getValue(7);
        const calendarPostsRes = getValue(8);

        const getCount = (res: any) => {
          if (!res) return 0;
          if (res.data?.totalElements !== undefined) return res.data.totalElements;
          if (res.data?.data?.totalElements !== undefined) return res.data.data.totalElements;
          const content = res.data?.content || res.data?.data || res.data;
          return Array.isArray(content) ? content.length : 0;
        };

        setStats({
          posts: getCount(publishedPostsRes),
          drafts: getCount(draftPostsRes),
          archived: getCount(archivedPostsRes),
          teamMembers: getCount(teamRes),
          media: getCount(mediaRes),
          departments: getCount(deptRes),
        });

        const recent = recentActivityRes?.data?.content || recentActivityRes?.data?.data || recentActivityRes?.data || [];
        setRecentPosts(Array.isArray(recent) ? recent : []);

        const top = topPostsRes?.data?.content || topPostsRes?.data?.data || topPostsRes?.data || [];
        setTopPosts(
          Array.isArray(top)
            ? top.map(p => ({
              id: p.id,
              title: p?.title || 'Untitled',
              views: p?.viewCount || 0
            }))
            : []
        );

        const calPosts = calendarPostsRes?.data?.content || calendarPostsRes?.data?.data || calendarPostsRes?.data || [];
        setCalendarPosts(Array.isArray(calPosts) ? calPosts : []);

      } catch (error: any) {
        // Log as string to prevent Next.js dev overlay from taking over the screen
        console.warn("Failed to fetch dashboard metrics:", error?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpiData = [
    { label: 'Total Published Posts', href: '/dashboard/posts', value: stats.posts, trend: `${stats.drafts} ${stats.drafts === 1 ? 'draft' : 'drafts'} · ${stats.archived} archived`, icon: FileText, color: 'text-brand-green-dark', bg: 'bg-brand-green-soft' },
    { label: 'Total Department Heads', href: '/dashboard/team', value: stats.teamMembers, trend: 'Profiles on the public site', icon: Users, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Total Media Assets', href: '/dashboard/media', value: stats.media, trend: 'Images and documents', icon: ImageIcon, color: 'text-purple-700', bg: 'bg-purple-50' },
    { label: 'Active Department Branches', href: '/dashboard/organization/departments', value: stats.departments, trend: 'Listed on the public site', icon: Building2, color: 'text-amber-700', bg: 'bg-amber-50' },
  ];

  const handleDashStatusChange = async (item: any, newStatus: string) => {
    try {
      await updatePostStatus(item.id, newStatus);
      setRecentPosts((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: newStatus } : p)));
      toast.success(`Status changed to ${newStatus.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
{/* Welcome Card */}
      <div className="bg-linear-to-r from-brand-green to-teal-deep rounded-xl px-6 py-5 sm:px-8 sm:py-6 shadow-md border border-brand-green overflow-hidden relative">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 opacity-90" aria-hidden="true" />
            {greeting}, {name}
          </h1>
          {/* min-h reserves the line so the banner doesn't jump when the date fills in */}
          <p className="mt-1 min-h-6 text-base text-white/85">{today}</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-white/10 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="bg-canvas rounded-xl p-6 shadow-sm border border-hairline hover:shadow-md hover:border-brand-green/40 transition-[box-shadow,border-color] duration-200 flex flex-col justify-between group outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-semibold text-steel group-hover:text-ink transition-colors duration-200">{kpi.label}</p>
                <div className={`w-10 h-10 rounded-full ${kpi.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} aria-hidden="true" />
                </div>
              </div>
              <div>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
                ) : (
                  <>
                    <p className="text-4xl font-bold text-ink tracking-tight">
                      <CountUp end={kpi.value} />
                    </p>
                    <p className={`text-xs font-medium mt-2 ${kpi.color}`}>{kpi.trend}</p>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Row 4: Charts Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5">
        <TopPostsChart posts={topPosts} loading={loading} />
        <ContentCalendar posts={calendarPosts} loading={loading} />
      </div>

      {/* Row 5: Recent Activity */}
      <div className="mt-6">
        <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-ink">Recent Activity</h2>
            <Link href="/dashboard/posts" className="inline-block py-1.5 -my-1.5 pointer-coarse:py-3 pointer-coarse:-my-3 text-sm font-medium text-brand-green-dark hover:underline">
              View All Posts
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-steel min-w-150">
              <thead>
                <tr className="border-b border-hairline text-muted text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading recent activity...
                    </td>
                  </tr>
                ) : recentPosts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-steel">
                      No recent activity found.
                    </td>
                  </tr>
                ) : (
                  recentPosts.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-surface-soft transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface border border-hairline flex items-center justify-center text-muted group-hover:bg-brand-green-soft group-hover:text-brand-green group-hover:border-brand-green/30 transition-all shadow-sm">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-ink truncate max-w-75" title={item.title}>{item.title}</span>
                            <span className="text-xs text-steel mt-0.5">{item.category?.name || 'Uncategorized'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <StatusDropdown
                          value={item.status}
                          options={DASH_STATUS_OPTIONS}
                          onChangeStatus={(v) => handleDashStatusChange(item, v)}
                        />
                      </td>
                      <td className="py-4 text-muted text-sm">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
