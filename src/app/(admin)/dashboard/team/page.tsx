'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Users, Plus, Edit, Trash2, CheckCircle2, XCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';
import DeleteModal from '@/components/delete-modal';
import CreateButton from '@/components/create-button';
import PageHeader from '@/components/page-header';
import { toast } from 'sonner';
import { formatTenureYears, calculateExactDuration } from '@/lib/date-utils';

export default function TeamDirectoryPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/admin/team-members');
      const data = res.data?.content || res.data?.data || res.data || [];
      setMembers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load Chairman.');
    } finally {
      setLoading(false);
    }
  };

  const getTitleString = (title: string) => {
    if (!title) return '-';
    try {
      const parsed = JSON.parse(title);
      return parsed.text || parsed.en || title;
    } catch {
      return title;
    }
  };

  const openDeleteModal = (member: any) => {
    setMemberToDelete(member);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      await api.delete(`/api/v1/admin/team-members/${memberToDelete.id}`);
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      toast.success('Team member deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete team member');
    }
  };

  // Filter and Paginate Logic
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
      const title = getTitleString(member.title).toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || title.includes(query);
    });
  }, [members, searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, currentPage]);

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
        <span className="text-steel">Organization</span>
        <span>&gt;</span>
        <span className="text-ink font-medium">Chairman</span>
      </div>

      <PageHeader
        icon={Users}
        title="Chairman"
        description="Manage KFD's team roster, including the Chairman and department staff profiles."
        action={<CreateButton href="/dashboard/team/create" />}
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
              placeholder="Search by name or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas border border-hairline-strong rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-emerald-500 transition-all placeholder:text-muted text-ink"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full sm:min-w-[800px] text-left text-sm text-steel">
            <thead className="bg-surface-soft text-steel font-medium border-b border-hairline">
              <tr>
                <th className="px-6 py-4 w-12 text-center hidden sm:table-cell">NO.</th>
                <th className="px-6 py-4">Member Info</th>
                <th className="px-6 py-4 hidden sm:table-cell">Job Title</th>
                <th className="px-6 py-4 hidden sm:table-cell">Department</th>
                <th className="px-6 py-4 hidden sm:table-cell">Tenure</th>
                <th className="px-6 py-4 hidden sm:table-cell">Duration</th>
                <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                <th className="px-6 py-4 hidden sm:table-cell">Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                // Skeleton Loaders
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 bg-gray-200 rounded w-6 mx-auto"></div></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-steel">
                    {searchQuery ? "No members found matching your search." : "No members found. Add your first team member to get started."}
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-4 text-center hidden sm:table-cell text-steel">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-green-soft text-brand-green-dark flex items-center justify-center shrink-0 overflow-hidden border border-brand-green/30">
                          {member.headshotUrl ? (
                            <img src={getMediaUrl(member.headshotUrl)} alt={`${member.firstName} ${member.lastName}`} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-sm">
                              {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{member.firstName} {member.lastName}</p>
                          {/* Mobile Data Stack */}
                          <div className="mt-1 flex flex-col gap-1 sm:hidden font-normal">
                            <div className="text-xs text-steel">{getTitleString(member.title)}</div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {member.isActive ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-green-soft text-brand-green-dark border border-brand-green/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface text-steel border border-hairline-strong">
                                  <XCircle className="w-3 h-3" />
                                  Inactive
                                </span>
                              )}
                              <span className="text-[11px] text-muted border border-hairline bg-surface px-1.5 py-0.5 rounded">
                                {member.departmentName || 'No Dept'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ink font-medium hidden sm:table-cell">
                      {getTitleString(member.title)}
                    </td>
                    <td className="px-6 py-4 text-steel hidden sm:table-cell">
                      {member.departmentName || <span className="text-muted italic">None</span>}
                    </td>
                    <td className="px-6 py-4 text-steel hidden sm:table-cell whitespace-nowrap">
                      {member.termStartDate ? formatTenureYears(member.termStartDate, member.termEndDate) : '-'}
                    </td>
                    <td className="px-6 py-4 text-steel hidden sm:table-cell">
                      {member.termStartDate ? calculateExactDuration(member.termStartDate, member.termEndDate) : '-'}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {member.isActive ? (
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
                    <td className="px-6 py-4 text-steel hidden sm:table-cell">
                      {member.displayOrder || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/team/${member.id}/edit`}
                          className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
                          title="Edit Member"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(member)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Member"
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
        {!loading && filteredMembers.length > 0 && (
          <div className="px-6 py-4 border-t border-hairline-soft bg-surface-soft flex items-center justify-between">
            <span className="text-sm text-steel">
              Showing <span className="font-medium text-ink">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-ink">{Math.min(currentPage * itemsPerPage, filteredMembers.length)}</span> of <span className="font-medium text-ink">{filteredMembers.length}</span> members
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-hairline-strong text-steel hover:bg-surface hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === idx + 1
                      ? 'bg-brand-green text-on-primary'
                      : 'text-steel hover:bg-surface hover:text-ink'
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-hairline-strong text-steel hover:bg-surface hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        title="Delete Team Member?"
        description="This will permanently delete the team member's profile and bio. This action cannot be undone."
        itemName={`${memberToDelete?.firstName} ${memberToDelete?.lastName}`}
      />
    </div>
  );
}
