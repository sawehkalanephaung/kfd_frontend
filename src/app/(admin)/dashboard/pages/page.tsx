'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, FileText, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/pages');
      // Spring Data Page object returns the array in "content", or wrap in data
      const data = response.data?.content || response.data?.data || response.data || [];
      setPages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load pages. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (page: Page) => {
    setPageToDelete(page);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;
    try {
      await api.delete(`/api/v1/admin/pages/${pageToDelete.id}`);
      setPages((prev) => prev.filter((p) => p.id !== pageToDelete.id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete page');
      throw err;
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-500">Pages</span>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">All Pages</span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-6 h-6 text-emerald-500" />
            Pages
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your standalone content pages like About Us, Contact, and Policies.
          </p>
        </div>
        <Link
          href="/dashboard/pages/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Page
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
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Page</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading pages...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No pages found. Create your first one to get started.
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{page.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">/{page.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        page.status === 'PUBLISHED' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : page.status === 'DRAFT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/pages/${page.id}/edit`}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(page)}
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
        title="Remove Page?"
        itemName={`the '${pageToDelete?.title}' page`}
      />
    </div>
  );
}
