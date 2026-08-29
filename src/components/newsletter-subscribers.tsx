'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  Trash2,
  Mail,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  X,
  CalendarDays,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import DeleteModal from '@/components/delete-modal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

// ─── Date helper ──────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-canvas rounded-lg p-5 shadow-sm border border-hairline-soft flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null);

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/v1/admin/newsletter/subscribers');
      const data = res.data?.content || res.data?.data || res.data || [];
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load subscribers. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/api/v1/admin/newsletter/subscribers/${deleteTarget.id}`);
    toast.success(`"${deleteTarget.email}" was removed.`);
    setDeleteTarget(null);
    fetchSubscribers();
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const filtered = subscribers.filter((s) => {
    const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
          ? s.isActive
          : !s.isActive;
    return matchesSearch && matchesStatus;
  });

  const totalActive = subscribers.filter((s) => s.isActive).length;
  const totalInactive = subscribers.filter((s) => !s.isActive).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget ? `"${deleteTarget.email}"` : ''}
        description="This subscriber will be permanently removed. This action cannot be undone."
      />

      <div className="space-y-6">
        {/* Stats row */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Subscribers"
              value={subscribers.length}
              icon={<Users className="w-5 h-5 text-brand-green-dark" />}
              color="bg-brand-green-soft"
            />
            <StatCard
              label="Active"
              value={totalActive}
              icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />}
              color="bg-blue-50"
            />
            <StatCard
              label="Unsubscribed"
              value={totalInactive}
              icon={<XCircle className="w-5 h-5 text-red-500" />}
              color="bg-red-50"
            />
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-9 pr-9 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl flex-shrink-0">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${filterStatus === status
                  ? 'bg-canvas text-ink shadow-sm'
                  : 'text-steel hover:text-slate'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-canvas rounded-lg shadow-sm border border-hairline-soft">
            <div className="flex flex-col items-center gap-3 text-muted">
              <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
              <p>Loading subscribers...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-canvas rounded-lg shadow-sm border border-hairline text-center">
            <div className="w-14 h-14 bg-surface rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-muted" />
            </div>
            <h3 className="text-base font-semibold text-slate mb-1">
              {search || filterStatus !== 'all' ? 'No matching subscribers' : 'No subscribers yet'}
            </h3>
            <p className="text-sm text-muted">
              {search || filterStatus !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Subscribers will appear here once people sign up via the public newsletter form.'}
            </p>
          </div>
        ) : (
          /* Table */
          <div className="bg-canvas rounded-lg shadow-sm border border-hairline-soft overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_140px_140px_48px] gap-4 px-5 py-3 bg-surface border-b border-hairline">
              <span className="text-xs font-semibold text-steel uppercase tracking-wide">Email</span>
              <span className="text-xs font-semibold text-steel uppercase tracking-wide">Status</span>
              <span className="text-xs font-semibold text-steel uppercase tracking-wide flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" /> Subscribed
              </span>
              <span className="text-xs font-semibold text-steel uppercase tracking-wide flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" /> Unsubscribed
              </span>
              <span />
            </div>

            {/* Table rows */}
            <div className="divide-y divide-hairline-soft">
              {filtered.map((sub) => (
                <div
                  key={sub.id}
                  className="grid grid-cols-[1fr_120px_140px_140px_48px] gap-4 px-5 py-3.5 items-center hover:bg-surface/60 transition-colors group"
                >
                  {/* Email */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-brand-green-soft flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3.5 h-3.5 text-brand-green-dark" />
                    </div>
                    <span className="text-sm font-medium text-charcoal truncate">{sub.email}</span>
                  </div>

                  {/* Status badge */}
                  <div>
                    {sub.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green-dark bg-brand-green-soft px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-steel bg-surface px-2.5 py-1 rounded-full">
                        <XCircle className="w-3 h-3" />
                        Unsubscribed
                      </span>
                    )}
                  </div>

                  {/* Subscribed at */}
                  <span className="text-sm text-steel">{formatDate(sub.subscribedAt)}</span>

                  {/* Unsubscribed at */}
                  <span className="text-sm text-muted">{formatDate(sub.unsubscribedAt)}</span>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(sub)}
                    className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove subscriber"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer count */}
            <div className="px-5 py-3 border-t border-hairline-soft bg-surface">
              <p className="text-xs text-muted">
                Showing {filtered.length} of {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
