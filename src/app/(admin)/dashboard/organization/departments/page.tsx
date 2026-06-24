'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Building2, MoreVertical, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';

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
    } catch (err: any) {
      console.error(err);
      
      // Handle 409 Conflict error specifically
      if (err.response?.status === 409) {
        alert(err.response?.data?.message || 'Cannot delete this department because it has associated records (e.g., members, roles, or sub-departments). Please remove them first.');
      } else {
        alert(err.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-500">Organization</span>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">Departments</span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-emerald-500" />
            Departments
          </h1>
          <p className="text-gray-500 mt-1">
            Manage the operational units and organizational structure of KFD.
          </p>
        </div>
        <Link
          href="/dashboard/organization/departments/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Department
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
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Head of Dept</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading departments...
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No departments found. Create your first one to get started.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{dept.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">/{dept.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {dept.headMember ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                            {(dept.headMember.name || dept.headMember.first_name || 'U')[0].toUpperCase()}
                          </div>
                          <span>{dept.headMember.name || dept.headMember.first_name || 'Assigned'}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        dept.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {dept.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {dept.orderIndex}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {dept.updatedAt ? new Date(dept.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/organization/departments/${dept.id}/edit`}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(dept)}
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
        title="Remove Department?"
        itemName={`the '${departmentToDelete?.name}' department`}
      />
    </div>
  );
}
