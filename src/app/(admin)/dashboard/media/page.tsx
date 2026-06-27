'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UploadCloud, Trash2, Edit, FileText, Image as ImageIcon, Loader2, Video, Search, Copy, Check, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';
import DeleteModal from '@/components/delete-modal';

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
  
  // Media categories (hardcoded or fetched)
  const categories = ['general', 'News', 'Hero', 'Documents'];
  
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

      await api.delete(`/api/v1/admin/media/${mediaToDelete.id}`);
      setMedia((prev) => prev.filter((m) => m.id !== mediaToDelete.id));
    };

  const getFileIcon = (fileType: string) => {
    if (!fileType) return <FileText className="w-5 h-5 text-gray-400" />;
    if (fileType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatSize = (kb: number) => {
    if (!kb) return '0 KB';
    if (kb > 1024) return (kb / 1024).toFixed(2) + ' MB';
    return kb + ' KB';
  };

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <button onClick={handleCopy} className="text-gray-400 hover:text-emerald-600 transition-colors ml-1" title="Copy UUID">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    );
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-500">Media & Resources</span>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">Library</span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <UploadCloud className="w-6 h-6 text-emerald-500" />
            Media Library
          </h1>
          <p className="text-gray-500 mt-1">
            Manage all your uploaded images, videos, and documents.
          </p>
        </div>
        <Link
          href="/dashboard/media/upload"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          <UploadCloud className="w-5 h-5" />
          Upload New
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search media files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        
        <div className="relative w-full md:w-1/4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Uploaded Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading media...
                  </td>
                </tr>
              ) : media.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No media found. Upload your first file to get started.
                  </td>
                </tr>
              ) : (
                media.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {asset.fileType?.startsWith('image/') ? (
                            <img src={getMediaUrl(asset.fileUrl)} alt={asset.fileName} className="w-full h-full object-cover" />
                          ) : (
                            getFileIcon(asset.fileType)
                          )}
                        </div>
                        <div className="max-w-[200px] sm:max-w-xs">
                          <p className="font-medium text-gray-900 truncate" title={asset.fileName}>
                            <a href={getMediaUrl(asset.fileUrl)} target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">
                              {asset.fileName}
                            </a>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-400">{asset.fileType || 'Unknown format'}</p>
                            <span className="text-gray-300 text-xs">•</span>
                            <p className="text-xs font-mono text-gray-500 flex items-center">
                              {asset.id.substring(0, 8)}...
                              <CopyButton text={asset.id} />
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        {asset.mediaCategory || 'general'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatSize(asset.fileSizeKb)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/media/${asset.id}/edit`}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Media"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(asset)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Media"
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
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalElements)}</span> of <span className="font-medium">{totalElements}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-medium text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
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
