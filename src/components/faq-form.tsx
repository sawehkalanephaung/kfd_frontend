'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, MessageCircleQuestion, AlignLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface FaqFormProps {
  initialData?: any;
  isEdit?: boolean;
  faqId?: string;
}

export default function FaqForm({ initialData, isEdit, faqId }: FaqFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State matching the FaqDto
  const [formData, setFormData] = useState({
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    displayOrder: initialData?.displayOrder || 0,
    status: initialData?.status || 'PUBLISHED', // Assuming PUBLISHED / DRAFT
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/api/faqs/${faqId}`, formData);
      } else {
        await api.post('/api/faqs', formData);
      }
      router.push('/dashboard/pages/faqs');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save FAQ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar with Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/pages/faqs"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to FAQs
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create FAQ'}
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
          
          {/* FAQ Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-gray-400" />
              Frequently Asked Question
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Question</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g. How do I request a forest survey?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Answer</label>
                <textarea
                  rows={8}
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Enter the detailed answer..."
                ></textarea>
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
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
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
