'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, BarChart2, Settings } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface MetricFormProps {
  initialData?: any;
  isEdit?: boolean;
  metricId?: string;
  onSave?: () => void;
}

export default function MetricForm({ initialData, isEdit, metricId, onSave }: MetricFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State matching the GlobalMetric entity / DTO
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    metricValue: initialData?.metricValue || '',
    icon: initialData?.icon || '',
    displayOrder: initialData?.displayOrder || 0,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/api/v1/admin/metrics/${metricId}`, formData);
        toast.success('Successfully updated metric!');
      } else {
        await api.post('/api/v1/admin/metrics', formData);
        toast.success('Successfully created metric!');
      }
      if (onSave) {
        onSave();
      } else {
        router.push('/dashboard/organization/metrics');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save metric.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar with Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/organization/metrics"
          className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Statistics Metrics
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Metric'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info Card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-muted" />
              Metric Information
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Metric Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="e.g. Protected Forest Area"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Metric Value</label>
                  <input
                    type="text"
                    required
                    value={formData.metricValue}
                    onChange={(e) => setFormData({ ...formData, metricValue: e.target.value })}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="e.g. 200,000 Acres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Icon Identifier</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="e.g. TreePine (Lucide Icon name)"
                  />
                  <p className="text-xs text-muted mt-2">Optional icon identifier name</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">

          {/* Settings Card */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted" />
              Settings
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Status</label>
                <div className="flex items-center gap-3 bg-surface p-1.5 rounded-xl border border-hairline-strong">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: true })}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${formData.isActive ? 'bg-canvas text-brand-green-dark shadow-sm border border-brand-green/20' : 'text-steel hover:text-ink'
                      }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: false })}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!formData.isActive ? 'bg-canvas text-ink shadow-sm border border-hairline-strong' : 'text-steel hover:text-ink'
                      }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                />
                <p className="text-xs text-muted mt-2">Determines display order (lower = first)</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
