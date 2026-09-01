'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Building2, MoreVertical, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import CreateButton from '@/components/create-button';
import PageHeader from '@/components/page-header';
import toast from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  slug: string;
  status: string;
  orderIndex: number;
  headMember?: {
    id: string;
    name?: string;
    first_name?: string;
    last_name?: string;
  };
  updatedAt?: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      // Ensure your backend endpoint is correctly configured to return departments
      const response = await api.get('/api/v1/admin/departments');
      // Spring Data Page object returns the array in "content", or wrap in data
      const data = response.data?.content || response.data?.data || response.data || [];
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load departments. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (dept: Department) => {
    setDepartmentToDelete(dept);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await api.delete(`/api/v1/admin/departments/${departmentToDelete.id}`);
      setDepartments((prev) => prev.filter((d) => d.id !== departmentToDelete.id));
      toast.success(`"${departmentToDelete.name}" was successfully deleted.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete department. It may still be referenced by posts, team members, or other content.');
    } finally {
      setDeleteModalOpen(false);
      setDepartmentToDelete(null);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="text-steel hover:text-ink transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-steel">Organization</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Departments</span>
      </div>

      <PageHeader
        icon={Building2}
        title="Department Branches"
        description="Manage the operational units and organizational structure of KFD."
        action={<CreateButton href="/dashboard/organization/departments/create" />}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-canvas rounded-lg shadow-sm border border-hairline-soft overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full sm:min-w-200 text-left text-sm text-steel">
            <thead className="bg-surface-soft text-steel font-medium border-b border-hairline">
              <tr>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 hidden sm:table-cell">Head of Dept</th>
                <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                <th className="px-6 py-4 hidden sm:table-cell">Order</th>
                <th className="px-6 py-4 hidden md:table-cell">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading departments...
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-steel">
                    No departments found. Create your first one to get started.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink">{dept.name}</div>
                      <div className="text-xs text-muted mt-0.5 hidden sm:block">/{dept.slug}</div>
                      {/* Mobile Data Stack */}
                      <div className="mt-2 flex flex-col gap-1.5 sm:hidden font-normal">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${dept.status === 'ACTIVE'
                            ? 'bg-brand-green-soft text-brand-green-dark border border-brand-green/20'
                            : 'bg-surface text-slate border border-hairline-strong'
                            }`}>
                            {dept.status || 'ACTIVE'}
                          </span>
                          <span className="text-[11px] text-steel">Order: {dept.orderIndex}</span>
                        </div>
                        <div className="text-[11px] text-steel flex items-center gap-1">
                          {dept.headMember ? (
                             <span>Head: {dept.headMember.name || dept.headMember.first_name || 'Assigned'}</span>
                          ) : (
                             <span className="italic text-muted">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-steel hidden sm:table-cell">
                      {dept.headMember ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-green-soft text-brand-green-dark flex items-center justify-center text-xs font-bold">
                            {(dept.headMember.name || dept.headMember.first_name || 'U')[0].toUpperCase()}
                          </div>
                          <span>{dept.headMember.name || dept.headMember.first_name || 'Assigned'}</span>
                        </div>
                      ) : (
                        <span className="text-muted italic text-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${dept.status === 'ACTIVE'
                        ? 'bg-brand-green-soft text-brand-green-dark border border-brand-green/20'
                        : 'bg-surface text-slate border border-hairline-strong'
                        }`}>
                        {dept.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-steel hidden sm:table-cell">
                      {dept.orderIndex}
                    </td>
                    <td className="px-6 py-4 text-steel text-sm hidden md:table-cell">
                      {dept.updatedAt ? new Date(dept.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/organization/departments/${dept.id}/edit`}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(dept)}
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
        title="Remove Department?"
        itemName={`the '${departmentToDelete?.name}' department`}
      />
    </div>
  );
}
