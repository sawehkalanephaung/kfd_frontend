'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart2, Plus, Edit, Trash2, Loader2, CheckCircle2, XCircle, Eye, EyeOff, Info } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import CreateButton from '@/components/create-button';
import PageHeader from '@/components/page-header';
import { QuickToggle } from '@/components/ui/quick-toggle';
import toast from 'react-hot-toast';

/** Matches StatsSection.tsx's public-site cap — kept in sync so the "only
 * the first N appear publicly" note below stays accurate if that changes. */
const PUBLIC_DISPLAY_LIMIT = 4;

interface GlobalMetric {
  id: string;
  title: string;
  metricValue: string;
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
      setError('Failed to load statistics metrics. Ensure the backend is running.');
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

    try {
      await api.delete(`/api/v1/admin/metrics/${metricToDelete.id}`);
      setMetrics((prev) => prev.filter((m) => m.id !== metricToDelete.id));
      toast.success(`"${metricToDelete.title}" was successfully deleted.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete metric.');
    } finally {
      setDeleteModalOpen(false);
      setMetricToDelete(null);
    }
  };

  const handleStatusChange = async (metric: GlobalMetric, isActive: boolean) => {
    try {
      const res = await api.get(`/api/v1/admin/metrics/${metric.id}`);
      const fullMetric = res.data?.data || res.data;
      await api.put(`/api/v1/admin/metrics/${metric.id}`, { ...fullMetric, isActive });
      setMetrics((prev) => prev.map((m) => (m.id === metric.id ? { ...m, isActive } : m)));
      toast.success(`Status changed to ${isActive ? 'active' : 'hidden'}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const activeCount = metrics.filter((m) => m.isActive).length;

  return (
    <div>
<PageHeader
        icon={BarChart2}
        title="Statistics Metrics"
        description="Manage the key statistics displayed across your public website."
        action={<CreateButton href="/dashboard/organization/metrics/create" />}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {activeCount > PUBLIC_DISPLAY_LIMIT && (
        <div className="flex items-start gap-2.5 bg-info-bg text-info-text p-4 rounded-xl mb-6 border border-current/10 text-sm">
          <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            {activeCount} metrics are Active, but the public site only shows the first {PUBLIC_DISPLAY_LIMIT}, sorted by{' '}
            <span className="font-semibold">Order</span>. Metrics beyond that won&apos;t appear until an earlier one is hidden
            or its order is changed.
          </p>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-canvas rounded-lg shadow-sm border border-hairline-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full sm:min-w-200 text-left text-sm text-steel">
            <thead className="bg-surface-soft text-steel font-medium border-b border-hairline">
              <tr>
                <th className="px-6 py-4">Metric Title</th>
                <th className="px-6 py-4 text-center">Value</th>
                <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                <th className="px-6 py-4 hidden sm:table-cell text-center">Order</th>
                <th className="px-6 py-4 hidden md:table-cell">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading metrics...
                  </td>
                </tr>
              ) : metrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-steel">
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
                          <QuickToggle
                            isOn={metric.isActive}
                            onLabel="Show"
                            offLabel="Hidden"
                            onToggle={(next) => handleStatusChange(metric, next)}
                            size="sm"
                          />
                          <span className="text-[11px] text-steel">Order: {metric.displayOrder}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-brand-green-dark">
                      {metric.metricValue}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <QuickToggle
                        isOn={metric.isActive}
                        onLabel="Show"
                        offLabel="Hidden"
                        onToggle={(next) => handleStatusChange(metric, next)}
                      />
                    </td>
                    <td className="px-6 py-4 text-steel text-center hidden sm:table-cell">
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
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(metric)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          aria-label="Delete"
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
