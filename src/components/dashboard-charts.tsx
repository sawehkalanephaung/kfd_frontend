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

const STATUS_COLORS = ['#10b981', '#f59e0b', '#9ca3af']; // Published (Green), Draft (Amber), Archived (Gray)

export default function DashboardCharts({ statusData, topPosts, loading = false }: DashboardChartsProps) {
  
  // If there are no posts with views, we can show a placeholder or just render an empty chart
  const hasTopPosts = topPosts.length > 0;
  // If all statuses are 0, PieChart might not render well, so we can provide a fallback
  const totalStatus = statusData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Top Viewed Posts Chart */}
      <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline flex flex-col">
        <h3 className="text-lg font-bold text-ink mb-6">Top Viewed Posts</h3>
        <div className="flex-1 min-h-[300px] w-full relative flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted" />
          ) : !hasTopPosts ? (
            <p className="text-muted text-sm">No views data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPosts} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} width={160} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="views" fill="#047857" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Content Status Breakdown Chart */}
      <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline flex flex-col">
        <h3 className="text-lg font-bold text-ink mb-6">Content Status Breakdown</h3>
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
