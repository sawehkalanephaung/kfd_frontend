'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, FileText, Loader2, Eye, EyeOff, Archive, CalendarDays, FolderTree, Search, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';

import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import CreateButton from '@/components/create-button';
import PageHeader from '@/components/page-header';
import { CustomSelect } from '@/components/ui/custom-select';

interface Publication {
  id: string;
  title: string;
  slug: string;
  category: { name: string } | null;
  status: string;
  publishedDate: string;
  updatedAt: string;
  downloadCount: number;
}

export default function PublicationsListPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<Publication | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchPublications();
  }, [debouncedSearch, selectedCategory, selectedStatus, currentPage]);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage - 1),
        size: String(itemsPerPage),
        sort: 'createdAt,desc'
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await api.get(`/api/v1/admin/cms/publications?${params.toString()}`);

      const content = response.data?.content || response.data?.data || response.data || [];
      setPublications(Array.isArray(content) ? content : []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalElements(response.data?.totalElements || content.length);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load publications. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/v1/admin/cms/publication-categories');
      setCategories(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const openDeleteModal = (publication: Publication) => {
    setPublicationToDelete(publication);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!publicationToDelete) return;
    try {
      const res = await api.delete(`/api/v1/admin/cms/publications/${publicationToDelete.id}`);
      const message = res.data?.message || 'Publication action completed successfully.';
      toast.success(message);
      fetchPublications();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete publication.');
    } finally {
      setDeleteModalOpen(false);
      setPublicationToDelete(null);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Publications</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">All Publications</span>
      </div>

      <PageHeader
        icon={FileText}
        title="Publications"
        description="Manage reports, press releases, and other official publications."
        action={<CreateButton href="/dashboard/publications/create" />}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-canvas rounded-lg p-4 shadow-sm border border-hairline-soft flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-2/5">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search publications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-hairline-strong rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
          />
        </div>

        <div className="flex w-full md:w-3/5 gap-4">
          <div className="relative w-full md:w-1/2">
            <div className="w-full pl-8">
              <CustomSelect
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                placeholder="All Categories"
                options={categories.map((cat: any) => ({ value: cat.name, label: cat.name }))}
                clearable
              />
            </div>
          </div>

          <div className="relative w-full md:w-1/2">
            <div className="w-full pl-8">
              <CustomSelect
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                placeholder="All Statuses"
                options={[
                  { value: 'PUBLISHED', label: 'Published' },
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'ARCHIVED', label: 'Archived' }
                ]}
                clearable
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-canvas rounded-lg shadow-sm border border-hairline-soft overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full sm:min-w-[900px] text-left text-sm text-steel">
            <thead className="bg-surface-soft border-b border-hairline">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Published</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Downloads</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-5 bg-gray-200 rounded w-64 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4 hidden sm:table-cell"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : publications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-steel">
                    No publications found matching your criteria.
                  </td>
                </tr>
              ) : (
                publications.map((publication) => (
                  <tr key={publication.id} className="group hover:bg-surface-soft hover:-translate-y-0.5 hover:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300">
                    <td className="px-6 py-4 font-medium text-ink max-w-md">
                      <div className="truncate" title={publication.title}>{publication.title}</div>
                      <div className="text-xs text-muted font-normal mt-0.5 hidden sm:block">/{publication.slug}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden font-normal">
                        {publication.category ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface rounded text-[10px] font-medium text-slate">
                            <FolderTree className="w-3 h-3" />
                            {publication.category.name}
                          </span>
                        ) : null}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${publication.status === 'PUBLISHED'
                            ? 'bg-brand-green-soft text-brand-green-dark border border-brand-green/20'
                            : publication.status === 'DRAFT'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-surface text-slate border border-hairline-strong'
                          }`}>
                          {publication.status === 'PUBLISHED' ? <Eye className="w-3 h-3" /> : publication.status === 'DRAFT' ? <EyeOff className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                          {publication.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {publication.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface rounded-md font-medium text-xs text-slate">
                          <FolderTree className="w-3.5 h-3.5" />
                          {publication.category.name}
                        </span>
                      ) : (
                        <span className="text-muted italic text-xs">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${publication.status === 'PUBLISHED'
                          ? 'bg-brand-green-soft text-brand-green-dark border border-brand-green/20'
                          : publication.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-surface text-slate border border-hairline-strong'
                        }`}>
                        {publication.status === 'PUBLISHED' ? <Eye className="w-3.5 h-3.5" /> : publication.status === 'DRAFT' ? <EyeOff className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        {publication.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-steel text-sm hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-muted" />
                        {publication.publishedDate ? new Date(publication.publishedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-steel text-sm hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-muted" />
                        {publication.downloadCount ?? 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/publications/${publication.id}/edit`}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-all duration-300 hover:scale-110 hover:rotate-[-5deg]"
                          title="Edit Publication"
                          aria-label="Edit Publication"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(publication)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-6"
                          title={publication.status === 'ARCHIVED' ? 'Permanently Delete' : 'Archive'}
                          aria-label={publication.status === 'ARCHIVED' ? 'Permanently Delete' : 'Archive'}
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

        {/* Pagination Footer */}
        {totalElements > 0 && (
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
        title={publicationToDelete?.status === 'ARCHIVED' ? "Permanently Delete Publication?" : "Archive Publication?"}
        description={publicationToDelete?.status === 'ARCHIVED'
          ? "This will permanently delete the publication and cannot be undone."
          : "This will move the publication to the ARCHIVED status. You can delete it permanently later."}
        itemName={`the '${publicationToDelete?.title}' publication`}
      />
    </div>
  );
}
