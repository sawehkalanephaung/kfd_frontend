'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, FileText, Loader2, Eye, EyeOff, Archive, CalendarDays, FolderTree } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';

interface Post {
  id: string;
  title: string;
  slug: string;
  category: { name: string } | null;
  status: string;
  publishedAt: string;
  updatedAt: string;
}

export default function PostsListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/cms/posts');
      // Spring Data Page object returns the array in "content"
      const data = response.data?.content || response.data?.data || response.data || [];
      setPosts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load posts. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (post: Post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await api.delete(`/api/v1/admin/cms/posts/${postToDelete.id}`);
      // Refresh to see if it was archived or hard deleted
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete post');
      throw err;
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-500">Posts & News</span>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">All Posts</span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-6 h-6 text-emerald-500" />
            Posts & News
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your articles, news updates, and organization announcements.
          </p>
        </div>
        <Link
          href="/dashboard/posts/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Post
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
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading posts...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No posts found. Create your first one to get started.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-md">
                      <div className="truncate" title={post.title}>{post.title}</div>
                      <div className="text-xs text-gray-400 font-normal mt-0.5">/{post.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      {post.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md font-medium text-xs text-gray-700">
                          <FolderTree className="w-3.5 h-3.5" />
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        post.status === 'PUBLISHED' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : post.status === 'DRAFT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {post.status === 'PUBLISHED' ? <Eye className="w-3.5 h-3.5" /> : post.status === 'DRAFT' ? <EyeOff className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                        {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(post)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={post.status === 'ARCHIVED' ? 'Permanently Delete' : 'Archive'}
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
        title={postToDelete?.status === 'ARCHIVED' ? "Permanently Delete Post?" : "Archive Post?"}
        description={postToDelete?.status === 'ARCHIVED' 
          ? "This will permanently delete the post and cannot be undone." 
          : "This will move the post to the ARCHIVED status. You can delete it permanently later."}
        itemName={`the '${postToDelete?.title}' post`}
      />
    </div>
  );
}
