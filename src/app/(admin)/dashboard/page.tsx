'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, UploadCloud, UserPlus, FileText, CheckCircle2, Clock, Loader2, Users, Image as ImageIcon, Building2, LayoutDashboard } from 'lucide-react';
import DashboardCharts from '@/components/dashboard-charts';
import CountUp from '@/components/ui/count-up';
import api from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    posts: 0,
    drafts: 0,
    archived: 0,
    teamMembers: 0,
    media: 0,
    departments: 0,
  });

  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<{ name: string, views: number }[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all necessary data in parallel
        const [
          publishedPostsRes,
          draftPostsRes,
          archivedPostsRes,
          teamRes,
          mediaRes,
          deptRes,
          recentActivityRes,
          topPostsRes
        ] = await Promise.all([
          api.get('/api/v1/admin/cms/posts?status=PUBLISHED&size=1'),
          api.get('/api/v1/admin/cms/posts?status=DRAFT&size=1'),
          api.get('/api/v1/admin/cms/posts?status=ARCHIVED&size=1'),
          api.get('/api/v1/admin/team-members?size=1'),
          api.get('/api/v1/admin/media?size=1'),
          api.get('/api/v1/admin/departments?size=1'),
          api.get('/api/v1/admin/cms/posts?size=5&sort=updatedAt,desc'),
          api.get('/api/v1/admin/cms/posts?size=5&sort=viewCount,desc')
        ]);

        const getCount = (res: any) => {
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

        const recent = recentActivityRes.data?.content || recentActivityRes.data?.data || recentActivityRes.data || [];
        setRecentPosts(Array.isArray(recent) ? recent : []);

        const top = topPostsRes.data?.content || topPostsRes.data?.data || topPostsRes.data || [];
        setTopPosts(
          Array.isArray(top)
            ? top.map(p => ({
              name: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title,
              views: p.viewCount || 0
            }))
            : []
        );

      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpiData = [
    { label: 'Total Published Posts', value: stats.posts, trend: 'Live from Database', icon: FileText, color: 'text-brand-green-dark', bg: 'bg-brand-green-soft' },
    { label: 'Total Team Members', value: stats.teamMembers, trend: 'Active in System', icon: Users, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Total Media Assets', value: stats.media, trend: 'Images & Documents', icon: ImageIcon, color: 'text-purple-700', bg: 'bg-purple-50' },
    { label: 'Active Department Branches', value: stats.departments, trend: 'Registered Branches', icon: Building2, color: 'text-amber-700', bg: 'bg-amber-50' },
  ];

  const statusData = [
    { name: 'Published', value: stats.posts },
    { name: 'Draft (Pending)', value: stats.drafts },
    { name: 'Archived', value: stats.archived },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <span className="text-steel">Home</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Dashboard</span>
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-brand-green-dark via-brand-green to-teal-deep rounded-xl p-8 shadow-md border border-brand-green overflow-hidden relative animate-gradient-x">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 opacity-90" />
            Good morning, Admin!
          </h1>
          <p className="text-brand-green-soft/90 max-w-xl text-lg">
            Welcome to your KFD command center. Here is your overview for today.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-canvas rounded-xl p-6 shadow-sm border border-hairline hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:border-brand-green/30 transition-all duration-300 ease-out flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="flex items-start justify-between mb-4 relative z-10">
                <p className="text-sm font-semibold text-steel group-hover:text-ink transition-colors duration-300">{kpi.label}</p>
                <div className={`w-10 h-10 rounded-full ${kpi.bg} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <div className="relative z-10">
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
              
              {/* Modern Glass/Shine Reflection Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_ease-in-out] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none z-20"></div>

              {/* Subtle background glow on hover */}
              <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full ${kpi.bg} opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-2xl pointer-events-none z-0`}></div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <DashboardCharts statusData={statusData} topPosts={topPosts} loading={loading} />

      {/* Bottom Section: Recent Activity & Quick Actions */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-canvas rounded-lg p-6 shadow-sm border border-hairline">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-ink">Recent Activity</h3>
            <Link href="/dashboard/posts" className="text-sm font-medium text-brand-green-dark hover:text-brand-green-dark">
              View All Posts
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-steel min-w-[600px]">
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
                            <span className="font-semibold text-ink truncate max-w-[300px]" title={item.title}>{item.title}</span>
                            <span className="text-xs text-steel mt-0.5">{item.category?.name || 'Uncategorized'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'PUBLISHED'
                          ? 'bg-brand-green-soft text-brand-green-dark border border-brand-green/20'
                          : item.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-surface text-steel border border-hairline-strong'
                          }`}>
                          {item.status === 'PUBLISHED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {item.status}
                        </span>
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

        {/* Quick Actions */}
        <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline">
          <h3 className="text-lg font-bold text-ink mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <Link
              href="/dashboard/posts/create"
              className="flex items-center gap-4 p-4 rounded-xl border border-hairline hover:border-brand-green/30 hover:bg-brand-green-soft hover:shadow-md hover:-translate-y-1 transition-all group duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-brand-green-soft/50 flex items-center justify-center text-brand-green-dark group-hover:bg-brand-green group-hover:text-white transition-colors shadow-sm">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-ink group-hover:text-brand-green-dark transition-colors">Create New Post</p>
                <p className="text-xs text-steel mt-0.5">Draft a new article or page</p>
              </div>
            </Link>

            <Link
              href="/dashboard/media/upload"
              className="flex items-center gap-4 p-4 rounded-xl border border-hairline hover:border-blue-200 hover:bg-blue-50 hover:shadow-md hover:-translate-y-1 transition-all group duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-ink group-hover:text-blue-700 transition-colors">Upload Media</p>
                <p className="text-xs text-steel mt-0.5">Add photos or documents</p>
              </div>
            </Link>

            <Link
              href="/dashboard/team/create"
              className="flex items-center gap-4 p-4 rounded-xl border border-hairline hover:border-purple-200 hover:bg-purple-50 hover:shadow-md hover:-translate-y-1 transition-all group duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100/50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-ink group-hover:text-purple-700 transition-colors">Add Team Member</p>
                <p className="text-xs text-steel mt-0.5">Invite a new system user</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
