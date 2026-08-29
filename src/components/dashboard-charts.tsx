'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface DashboardChartsProps {
  statusData: { name: string; value: number }[];
  topPosts: { name: string; views: number }[];
  loading?: boolean;
}

// Matches Badge's success/warning/neutral tones (see src/components/ui/badge.tsx)
// so a post's chart color and its status-pill color are the same green/amber/gray,
// instead of this chart's own unrelated hex triplet.
const STATUS_COLORS = ['var(--color-brand-green)', 'var(--color-warning-text)', 'var(--color-muted)']; // Published, Draft, Archived

export default function DashboardCharts({ statusData, topPosts, loading = false }: DashboardChartsProps) {
  
  // If there are no posts with views, we can show a placeholder or just render an empty chart
  const hasTopPosts = topPosts.length > 0;
  // If all statuses are 0, PieChart might not render well, so we can provide a fallback
  const totalStatus = statusData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Top Viewed Posts Chart */}
      <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline flex flex-col">
        <h2 className="text-lg font-bold text-ink mb-6">Top Viewed Posts</h2>
        <div className="flex-1 min-h-[300px] w-full relative flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted" />
          ) : !hasTopPosts ? (
            <p className="text-muted text-sm">No views data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPosts} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-hairline-soft)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-steel)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-steel)', fontSize: 11 }} width={160} />
                <Tooltip
                  cursor={{ fill: 'var(--color-surface-soft)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-canvas)', color: 'var(--color-ink)' }}
                />
                <Bar dataKey="views" fill="var(--color-brand-green-dark)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Content Status Breakdown Chart */}
      <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline flex flex-col">
        <h2 className="text-lg font-bold text-ink mb-6">Content Status Breakdown</h2>
        <div className="flex-1 min-h-[300px] w-full relative flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted" />
          ) : totalStatus === 0 ? (
            <p className="text-muted text-sm">No content published yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-canvas)', color: 'var(--color-ink)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-steel">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
