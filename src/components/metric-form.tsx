'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, BarChart2, Settings } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface MetricFormProps {
  initialData?: any;
  isEdit?: boolean;
  metricId?: string;
}

export default function MetricForm({ initialData, isEdit, metricId }: MetricFormProps) {
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
      } else {
        await api.post('/api/v1/admin/metrics', formData);
      }
      router.push('/dashboard/organization/metrics');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save metric.');
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
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Global Metrics
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-gray-400" />
              Metric Information
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Metric Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g. Protected Forest Area"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Metric Value</label>
                  <input
                    type="text"
                    required
                    value={formData.metricValue}
                    onChange={(e) => setFormData({...formData, metricValue: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g. 200,000 Acres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Icon Identifier</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g. TreePine (Lucide Icon name)"
                  />
                  <p className="text-xs text-gray-400 mt-2">Optional icon identifier name</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Settings Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              Settings
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isActive: true})}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      formData.isActive ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isActive: false})}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      !formData.isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <p className="text-xs text-gray-400 mt-2">Determines display order (lower = first)</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
