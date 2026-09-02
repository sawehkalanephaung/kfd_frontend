'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UploadCloud, Trash2, Edit, FileText, Image as ImageIcon, Images, Loader2, Video, Search, Filter } from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import toast from 'react-hot-toast';
import { CustomSelect } from '@/components/ui/custom-select';

interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeKb: number;
  mediaCategory: string;
  departmentId: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/v1/admin/cms/categories').catch(() => ({ data: [] }));
        const data = res.data?.content || res.data?.data?.content || res.data?.data || res.data || [];
        const cats = Array.isArray(data) ? data.map((c: any) => c.name) : [];
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaAsset | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchMedia();
  }, [debouncedSearch, selectedCategory, currentPage]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage - 1),
        size: String(itemsPerPage),
        sort: 'createdAt,desc'
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await api.get(`/api/v1/admin/media?${params.toString()}`);

      const content = response.data?.content || response.data?.data?.content || response.data?.data || [];
      setMedia(Array.isArray(content) ? content : []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalElements(response.data?.totalElements || content.length);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load media library.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (asset: MediaAsset) => {
    setMediaToDelete(asset);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;

    try {
      await api.delete(`/api/v1/admin/media/${mediaToDelete.id}`);
      setMedia((prev) => prev.filter((m) => m.id !== mediaToDelete.id));
      toast.success(`"${mediaToDelete.fileName}" was successfully deleted.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete file. It may still be referenced by a post or page.');
    } finally {
      setDeleteModalOpen(false);
      setMediaToDelete(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (!fileType) return <FileText className="w-5 h-5 text-muted" />;
    if (fileType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-steel" />;
  };

  const formatSize = (kb: number) => {
    if (!kb) return '0 KB';
    if (kb > 1024) return (kb / 1024).toFixed(2) + ' MB';
    return kb + ' KB';
  };



  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Media & Resources</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Library</span>
      </div>

      <PageHeader
        icon={Images}
        title="Media Library"
        description="Manage all your uploaded images, videos, and documents."
        action={
          <Button href="/dashboard/media/upload">
            <UploadCloud className="w-5 h-5" />
            Upload
          </Button>
        }
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-canvas rounded-lg p-4 shadow-sm border border-hairline-soft flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search media files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-hairline-strong rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
          />
        </div>

        <div className="relative w-full md:w-1/4">
          <div className="w-full pl-8">
            <CustomSelect
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              placeholder="All Categories"
              options={categories.map((cat) => ({ value: cat, label: cat }))}
              clearable
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-canvas rounded-lg shadow-sm border border-hairline-soft overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-200 text-left text-sm text-steel">
            <thead className="bg-surface-soft border-b border-hairline">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Uploaded Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                // Skeleton Loaders
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-md w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : media.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-steel">
                    No media found. Upload your first file to get started.
                  </td>
                </tr>
              ) : (
                media.map((asset) => (
                  <tr key={asset.id} className="group hover:bg-surface-soft hover:-translate-y-0.5 hover:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0 overflow-hidden">
                          {asset.fileType?.startsWith('image/') ? (
                            <img src={getMediaUrl(asset.fileUrl)} alt={asset.fileName} className="w-full h-full object-cover" />
                          ) : (
                            getFileIcon(asset.fileType)
                          )}
                        </div>
                        <div className="max-w-50 sm:max-w-xs">
                          <p className="font-medium text-ink truncate" title={asset.fileName}>
                            <a href={getMediaUrl(asset.fileUrl)} target="_blank" rel="noreferrer" className="hover:text-brand-green-dark transition-colors">
                              {asset.fileName}
                            </a>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted">{asset.fileType || 'Unknown format'}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-surface text-steel">
                        {asset.mediaCategory || 'general'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-steel">
                      {formatSize(asset.fileSizeKb)}
                    </td>
                    <td className="px-6 py-4 text-steel">
                      {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/media/${asset.id}/edit`}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-all duration-300 hover:scale-110 hover:rotate-[-5deg]"
                          title="Edit Media"
                          aria-label="Edit Media"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(asset)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-6"
                          title="Delete Media"
                          aria-label="Delete Media"
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
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Media?"
        description="This will permanently delete the file from storage. If this file is being used in any posts or pages, it will break those links."
        itemName={`the file '${mediaToDelete?.fileName}'`}
      />
    </div>
  );
}
