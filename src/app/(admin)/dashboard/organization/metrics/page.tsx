'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, BarChart2, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';

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
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-500">Organization</span>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">Global Metrics</span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-emerald-500" />
            Global Metrics
          </h1>
          <p className="text-gray-500 mt-1">
            Manage the high-level statistics and metrics displayed across the platform.
          </p>
        </div>
        <Link
          href="/dashboard/organization/metrics/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Metric
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Metric Title</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Icon</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading metrics...
                  </td>
                </tr>
              ) : metrics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No metrics found. Create your first one to get started.
                  </td>
                </tr>
              ) : (
                metrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {metric.title}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {metric.metricValue}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {metric.icon ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-gray-100 rounded-md font-mono text-xs text-gray-600">
                            {metric.icon}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {metric.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <Eye className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          <EyeOff className="w-3.5 h-3.5" />
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {metric.displayOrder}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {metric.updatedAt ? new Date(metric.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/organization/metrics/${metric.id}/edit`}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(metric)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
