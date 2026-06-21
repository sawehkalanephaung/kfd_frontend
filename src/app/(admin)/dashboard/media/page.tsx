'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UploadCloud, Trash2, Edit, FileText, Image as ImageIcon, Loader2, Video, Search } from 'lucide-react';
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
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaAsset | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/media?size=100');
      
      const data = response.data?.content || response.data?.data?.content || response.data?.data || [];
      setMedia(Array.isArray(data) ? data : []);
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
    } catch (err) {
      console.error(err);
      alert('Failed to delete media');
      throw err;
    }
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
                          <p className="text-xs text-gray-400">{asset.fileType || 'Unknown format'}</p>
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
