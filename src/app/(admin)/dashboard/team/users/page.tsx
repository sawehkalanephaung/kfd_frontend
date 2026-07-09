'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Edit, Trash2, Loader2, CheckCircle2, XCircle, Shield } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import SlideOver from '@/components/slide-over';
import UserForm from '@/components/user-form';

export default function UsersDirectoryPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    fetchUsers();

    // Check if we need to auto-open a user for editing (e.g. from a failed login notification)
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editUserId');
    if (editId) {
      // Slight delay ensures the slide-over transition works smoothly
      setTimeout(() => {
        openEditDrawer({ id: editId });
        // Clean up the URL so it doesn't reopen on refresh
        window.history.replaceState({}, '', '/dashboard/team/users');
      }, 300);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/admin/users');
      // Spring Data Page Response structure:
      const data = res.data?.content || res.data?.data?.content || res.data?.data || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load system users.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (user: any) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

      await api.delete(`/api/v1/admin/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setDeleteModalOpen(false);
    };

  const openCreateDrawer = () => {
    setIsEditMode(false);
    setEditingUser(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = async (user: any) => {
    setIsEditMode(true);
    setEditingUser(null);
    setDrawerOpen(true);
    setFetchingDetails(true);
    try {
      const res = await api.get(`/api/v1/admin/users/${user.id}`);
      setEditingUser(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load user details');
      setDrawerOpen(false);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleDrawerSuccess = () => {
    setDrawerOpen(false);
    fetchUsers();
  };

  const formatForDisplay = (name: string) => {
    if (!name) return '';
    return name.replace('ROLE_', '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const filteredUsers = users.filter((user) => {
    if (statusFilter === 'active') return user.isActive === true;
    if (statusFilter === 'inactive') return user.isActive === false;
    return true;
  });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <Link href="/dashboard/team" className="text-steel hover:text-ink transition-colors">Team Directory</Link>
        <span>&gt;</span>
        <span className="text-ink font-medium">System Users</span>
      </div>

      {/* Header Section */}
      <div className="bg-canvas rounded-lg p-8 shadow-sm border border-hairline-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <Users className="w-6 h-6 text-brand-green" />
            System Users
          </h1>
          <p className="text-steel mt-1">
            Manage administrative users who have access to this dashboard.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-surface border border-hairline-strong rounded-xl text-sm font-medium text-slate focus:outline-none focus:ring-2 focus:ring-brand-green transition-all cursor-pointer"
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive / Suspended</option>
          </select>
          <button
            onClick={openCreateDrawer}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-primary-deep text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add System User
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-canvas rounded-lg shadow-sm border border-hairline-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm text-steel">
            <thead className="bg-surface-soft text-steel font-medium border-b border-hairline">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-steel">
                    No system users found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-green-soft text-brand-green-dark flex items-center justify-center shrink-0 border border-brand-green/30 font-bold text-sm">
                          {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || ''}
                        </div>
                        <p className="font-medium text-ink">{user.firstName} {user.lastName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-steel">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      {user.role ? (
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-brand-green" />
                          <span className="font-medium text-slate">{formatForDisplay(user.role.name)}</span>
                        </div>
                      ) : (
                        <span className="text-muted italic">No Role assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-green-soft text-brand-green-dark border border-brand-green/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface text-steel border border-hairline-strong">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDrawer(user)}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
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
        title="Delete System User?"
        description="This will permanently delete their account and revoke their dashboard access."
        itemName={`${userToDelete?.firstName} ${userToDelete?.lastName}`}
      />

      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isEditMode ? 'Edit User' : 'Create New User'}
      >
        {fetchingDetails ? (
          <div className="flex flex-col items-center justify-center py-20 text-steel">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
            Loading details...
          </div>
        ) : (
          <UserForm
            isEdit={isEditMode}
            initialData={editingUser}
            userId={editingUser?.id}
            isSlideOver={true}
            onSuccess={handleDrawerSuccess}
            onCancel={() => setDrawerOpen(false)}
          />
        )}
      </SlideOver>
    </div>
  );
}
