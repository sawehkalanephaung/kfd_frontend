'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, MessageCircleQuestion, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import CreateButton from '@/components/create-button';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface Faq {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  status: string;
}

export default function FaqsListPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<Faq | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      // Fetching all FAQs (including drafts) for admin view
      const response = await api.get('/api/v1/admin/faqs');
      
      // FAQ endpoint returns a direct List<Faq> according to backend code
      const data = response.data?.data || response.data || [];
      setFaqs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load FAQs. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (faq: Faq) => {
    setFaqToDelete(faq);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;

    try {
      await api.delete(`/api/v1/admin/faqs/${faqToDelete.id}`);
      setFaqs((prev) => prev.filter((f) => f.id !== faqToDelete.id));
      toast.success('FAQ was successfully deleted.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete FAQ.');
    } finally {
      setDeleteModalOpen(false);
      setFaqToDelete(null);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Pages</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">FAQs</span>
      </div>

      <PageHeader
        icon={MessageCircleQuestion}
        title="FAQs"
        description="Manage the FAQs displayed to users on the public portal."
        action={<CreateButton href="/dashboard/pages/faqs/create" />}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-canvas rounded-lg shadow-sm border border-hairline-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full sm:min-w-200 text-left text-sm text-steel">
            <thead className="bg-surface-soft text-steel font-medium border-b border-hairline">
              <tr>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                <th className="px-6 py-4 hidden sm:table-cell">Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading FAQs...
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-steel">
                    No FAQs found. Create your first one to get started.
                  </td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-4 font-medium text-ink max-w-md">
                      <div className="truncate" title={faq.question}>{faq.question}</div>
                      <div className="text-xs text-muted font-normal truncate mt-1" title={faq.answer}>{faq.answer}</div>
                      {/* Mobile Data Stack */}
                      <div className="mt-2 flex items-center gap-3 sm:hidden font-normal">
                        <Badge tone={faq.status === 'PUBLISHED' ? 'success' : 'neutral'} icon={faq.status === 'PUBLISHED' ? Eye : EyeOff} size="sm">
                          {faq.status}
                        </Badge>
                        <span className="text-[11px] text-muted">Order: {faq.displayOrder}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <Badge tone={faq.status === 'PUBLISHED' ? 'success' : 'neutral'} icon={faq.status === 'PUBLISHED' ? Eye : EyeOff}>
                        {faq.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-steel hidden sm:table-cell">
                      {faq.displayOrder}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/pages/faqs/${faq.id}/edit`}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(faq)}
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
        title="Remove FAQ?"
        itemName={`this FAQ`}
      />
    </div>
  );
}
