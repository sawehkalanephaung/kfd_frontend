'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Plus, Edit, Trash2, Loader2, Users } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import SlideOver from '@/components/slide-over';
import RoleForm from '@/components/role-form';
import EmptyState from '@/components/ui/empty-state';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function RolesDirectoryPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any | null>(null);

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/admin/roles');
      const data = res.data?.data || res.data || [];
      setRoles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (role: any) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await api.delete(`/api/v1/admin/roles/${roleToDelete.id}`);
      setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
      toast.success(`"${roleToDelete.name}" was successfully deleted.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete role. It may still be assigned to users.');
    } finally {
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const openCreateDrawer = () => {
    setIsEditMode(false);
    setEditingRole(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = async (role: any) => {
    setIsEditMode(true);
    setEditingRole(null);
    setDrawerOpen(true);
    setFetchingDetails(true);
    try {
      const res = await api.get(`/api/v1/admin/roles/${role.id}`);
      setEditingRole(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load role details');
      setDrawerOpen(false);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleDrawerSuccess = () => {
    setDrawerOpen(false);
    fetchRoles();
  };


  const formatForDisplay = (name: string) => {
    if (!name) return '';
    return name.replace('ROLE_', '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <Link href="/dashboard/team" className="text-steel hover:text-ink transition-colors">Chairman</Link>
        <span>&gt;</span>
        <span className="text-ink font-medium">Roles & Access</span>
      </div>

      <PageHeader
        icon={Shield}
        title="Roles & Access"
        description="Manage system roles, permissions, and access levels."
        action={
          <Button onClick={openCreateDrawer}>
            <Plus className="w-5 h-5" />
            Create
          </Button>
        }
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
          <table className="w-full min-w-200 text-left text-sm text-steel">
            <thead className="bg-surface-soft text-steel font-medium border-b border-hairline">
              <tr>
                <th className="px-6 py-4">Role Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading roles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12">
                    <EmptyState
                      title="No Roles Found"
                      description="Get started by creating a new role to manage system permissions."
                      icon={Shield}
                      actionLabel="Create Role"
                      onAction={openCreateDrawer}
                    />
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-green-soft text-brand-green-dark flex items-center justify-center shrink-0 border border-brand-green/20">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-ink">{formatForDisplay(role.name)}</p>
                          <p className="font-mono text-xs text-muted">{role.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-steel max-w-md truncate">{role.description || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDrawer(role)}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
                          title="Edit Role"
                          aria-label="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(role)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Role"
                          aria-label="Delete Role"
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
        title="Delete Role?"
        description="This will permanently delete this role. Make sure no users are currently assigned to it."
        itemName={roleToDelete?.name}
      />

      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isEditMode ? 'Edit Role' : 'Create New Role'}
      >
        {fetchingDetails ? (
          <div className="flex flex-col items-center justify-center py-20 text-steel">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
            Loading details...
          </div>
        ) : (
          <RoleForm
            isEdit={isEditMode}
            initialData={editingRole}
            roleId={editingRole?.id}
            isSlideOver={true}
            onSuccess={handleDrawerSuccess}
            onCancel={() => setDrawerOpen(false)}
          />
        )}
      </SlideOver>
    </div>
  );
}
