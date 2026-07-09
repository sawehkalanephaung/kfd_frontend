'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, BarChart2, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import CreateButton from '@/components/create-button';

interface GlobalMetric {
  id: string;
  title: string;
  metricValue: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  updatedAt: string;
}

export default function GlobalMetricsPage() {
  const [metrics, setMetrics] = useState<GlobalMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [metricToDelete, setMetricToDelete] = useState<GlobalMetric | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/metrics');
      // Spring Data Page object returns the array in "content", or wrap in data
      const data = response.data?.content || response.data?.data || response.data || [];
      setMetrics(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load global metrics. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (metric: GlobalMetric) => {
    setMetricToDelete(metric);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!metricToDelete) return;

      await api.delete(`/api/v1/admin/metrics/${metricToDelete.id}`);
      setMetrics((prev) => prev.filter((m) => m.id !== metricToDelete.id));
    };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Organization</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Global Metrics</span>
      </div>

      {/* Header Section */}
      <div className="bg-canvas rounded-lg p-8 shadow-sm border border-hairline-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-brand-green" />
            Global Metrics
          </h1>
          <p className="text-steel mt-1">
            Manage the high-level statistics and metrics displayed across the platform.
          </p>
        </div>
        <CreateButton href="/dashboard/organization/metrics/create" />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-canvas rounded-lg shadow-sm border border-hairline-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full sm:min-w-[800px] text-left text-sm text-steel">
            <thead className="bg-surface-soft text-steel font-medium border-b border-hairline">
              <tr>
                <th className="px-6 py-4">Metric Title</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4 hidden sm:table-cell">Icon</th>
                <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                <th className="px-6 py-4 hidden sm:table-cell">Order</th>
                <th className="px-6 py-4 hidden md:table-cell">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading metrics...
                  </td>
                </tr>
              ) : metrics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-steel">
                    No metrics found. Create your first one to get started.
                  </td>
                </tr>
              ) : (
                metrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-4 font-medium text-ink">
                      {metric.title}
                      {/* Mobile Data Stack */}
                      <div className="mt-1 flex flex-col gap-1.5 sm:hidden font-normal">
                        <div className="flex flex-wrap items-center gap-2">
                          {metric.isActive ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-green-soft text-brand-green-dark border border-brand-green/20">
                              <Eye className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface text-slate border border-hairline-strong">
                              <EyeOff className="w-3 h-3" />
                              Hidden
                            </span>
                          )}
                          <span className="text-[11px] text-steel">Order: {metric.displayOrder}</span>
                        </div>
                        {metric.icon ? (
                          <div className="text-[11px] text-steel flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-surface rounded-md font-mono text-[10px] text-steel">
                              {metric.icon}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-green-dark">
                      {metric.metricValue}
                    </td>
                    <td className="px-6 py-4 text-steel hidden sm:table-cell">
                      {metric.icon ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-surface rounded-md font-mono text-xs text-steel">
                            {metric.icon}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {metric.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-green-soft text-brand-green-dark border border-brand-green/20">
                          <Eye className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface text-slate border border-hairline-strong">
                          <EyeOff className="w-3.5 h-3.5" />
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-steel hidden sm:table-cell">
                      {metric.displayOrder}
                    </td>
                    <td className="px-6 py-4 text-steel text-sm hidden md:table-cell">
                      {metric.updatedAt ? new Date(metric.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/organization/metrics/${metric.id}/edit`}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(metric)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Global Metric?"
        itemName={`the '${metricToDelete?.title}' metric`}
      />
    </div>
  );
}
