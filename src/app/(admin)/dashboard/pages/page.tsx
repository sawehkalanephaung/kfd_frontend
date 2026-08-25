'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import CreateButton from '@/components/create-button';
import PageHeader from '@/components/page-header';
import toast from 'react-hot-toast';

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

  // Search and Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      toast.success('Page deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete page');
    }
  };

  // Filter and Paginate Logic
  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const title = (page.title || '').toLowerCase();
      const slug = (page.slug || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return title.includes(query) || slug.includes(query);
    });
  }, [pages, searchQuery]);

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);

  const paginatedPages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPages, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Pages</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">All Pages</span>
      </div>

      <PageHeader
        icon={FileText}
        title="Pages"
        description="Create and edit standalone content pages such as About Us, History, and Legal Policies."
        action={<CreateButton href="/dashboard/pages/create" />}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-canvas rounded-lg shadow-sm border border-hairline-soft overflow-hidden">

        {/* Search Bar */}
        <div className="p-4 border-b border-hairline-soft bg-surface-soft">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas border border-hairline-strong rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-emerald-500 transition-all placeholder:text-muted text-ink"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full sm:min-w-[800px] text-left text-sm text-steel">
            <thead className="bg-surface-soft border-b border-hairline">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Page</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Last Updated</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                // Skeleton Loaders
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-steel">
                    {searchQuery ? "No pages found matching your search." : "No pages found. Create your first one to get started."}
                  </td>
                </tr>
              ) : (
                paginatedPages.map((page) => (
                  <tr key={page.id} className="group hover:bg-surface-soft hover:-translate-y-0.5 hover:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink">{page.title}</div>
                      <div className="text-xs text-muted mt-0.5 hidden sm:block">/{page.slug}</div>
                      {/* Mobile Data Stack */}
                      <div className="mt-2 flex items-center gap-3 sm:hidden">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${page.status === 'PUBLISHED'
                            ? 'bg-brand-green-soft text-brand-green-dark border border-brand-green/20'
                            : page.status === 'DRAFT'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-surface text-slate border border-hairline-strong'
                          }`}>
                          {page.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${page.status === 'PUBLISHED'
                          ? 'bg-brand-green-soft text-brand-green-dark border border-brand-green/20'
                          : page.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-surface text-slate border border-hairline-strong'
                        }`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-steel text-sm hidden sm:table-cell">
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/pages/${page.id}/edit`}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-all duration-300 hover:scale-110 hover:rotate-[-5deg]"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(page)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-6"
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

        {/* Pagination Controls */}
        {!loading && filteredPages.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 bg-canvas rounded-b-lg">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-hairline-strong text-sm font-medium text-steel hover:bg-surface hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-sm w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="text-sm text-steel text-center">
              Page <span className="font-medium text-ink">{currentPage}</span> of <span className="font-medium text-ink">{totalPages}</span>
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-hairline-strong text-sm font-medium text-steel hover:bg-surface hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-sm w-full sm:w-auto justify-center"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
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
