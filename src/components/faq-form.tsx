'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, MessageCircleQuestion, AlignLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CustomSelect } from '@/components/ui/custom-select';

interface FaqFormProps {
  initialData?: any;
  isEdit?: boolean;
  faqId?: string;
  onSave?: () => void;
}

export default function FaqForm({ initialData, isEdit, faqId, onSave }: FaqFormProps) {
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
        toast.success('Successfully updated FAQ!');
      } else {
        await api.post('/api/faqs', formData);
        toast.success('Successfully created FAQ!');
      }
      if (onSave) {
        onSave();
      } else {
        router.push('/dashboard/pages/faqs');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save FAQ.';
      setError(msg);
      toast.error(msg);
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
          className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to FAQs
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
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
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-muted" />
              Frequently Asked Question
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Question</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="e.g. How do I request a forest survey?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Answer</label>
                <textarea
                  rows={8}
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="Enter the detailed answer..."
                ></textarea>
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
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData({...formData, status: val})}
                  options={[
                    { value: 'PUBLISHED', label: 'Published' },
                    { value: 'DRAFT', label: 'Draft' }
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
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
