'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Link2,
  LayoutList,
  ChevronDown,
  ChevronRight,
  GripVertical,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import api from '@/lib/api';
import DeleteModal from '@/components/delete-modal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FooterLink {
  id: string;
  label: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
}

interface FooterLinkSection {
  id: string;
  title: string;
  displayOrder: number;
  isActive: boolean;
  links: FooterLink[];
}

// ─── Inline editable input helper ─────────────────────────────────────────────

function InlineField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

// ─── Add / Edit Link Form ──────────────────────────────────────────────────────

function LinkForm({
  sectionId,
  initialData,
  nextOrder,
  onSuccess,
  onCancel,
}: {
  sectionId: string;
  initialData?: FooterLink;
  nextOrder: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initialData?.label || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [displayOrder, setDisplayOrder] = useState(
    initialData?.displayOrder ?? nextOrder
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) {
      setError('Label and URL are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = { label: label.trim(), url: url.trim(), displayOrder, isActive };
      if (initialData?.id) {
        await api.put(`/api/v1/admin/footer-links/links/${initialData.id}`, payload);
      } else {
        await api.post(`/api/v1/admin/footer-links/sections/${sectionId}/links`, payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3"
    >
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InlineField label="Label" value={label} onChange={setLabel} placeholder="e.g. About Us" />
        <InlineField label="URL" value={url} onChange={setUrl} placeholder="https://..." type="url" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InlineField
            label="Order"
            value={String(displayOrder)}
            onChange={(v) => setDisplayOrder(Number(v))}
            type="number"
            placeholder="1"
          />
          <label className="flex items-center gap-2 cursor-pointer mt-4">
            <div
              onClick={() => setIsActive((p) => !p)}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                isActive ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-xs font-medium text-gray-600">Active</span>
          </label>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {initialData ? 'Update' : 'Add Link'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Add / Edit Section Form ───────────────────────────────────────────────────

function SectionForm({
  initialData,
  nextOrder,
  onSuccess,
  onCancel,
}: {
  initialData?: FooterLinkSection;
  nextOrder: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [displayOrder, setDisplayOrder] = useState(
    initialData?.displayOrder ?? nextOrder
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Section title is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = { title: title.trim(), displayOrder, isActive };
      if (initialData?.id) {
        await api.put(`/api/v1/admin/footer-links/sections/${initialData.id}`, payload);
      } else {
        await api.post('/api/v1/admin/footer-links/sections', payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save section.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3"
    >
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div className="sm:col-span-2">
          <InlineField label="Section Title" value={title} onChange={setTitle} placeholder="e.g. Quick Links" />
        </div>
        <InlineField
          label="Order"
          value={String(displayOrder)}
          onChange={(v) => setDisplayOrder(Number(v))}
          type="number"
          placeholder="1"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setIsActive((p) => !p)}
            className={`w-10 h-5 rounded-full relative transition-colors ${
              isActive ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                isActive ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">Active</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {initialData ? 'Update Section' : 'Add Section'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Link Row ──────────────────────────────────────────────────────────────────

function LinkRow({
  link,
  sectionId,
  onRefresh,
}: {
  link: FooterLink;
  sectionId: string;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(false);

  const handleDelete = async () => {
    await api.delete(`/api/v1/admin/footer-links/links/${link.id}`);
    onRefresh();
  };

  if (editing) {
    return (
      <LinkForm
        sectionId={sectionId}
        initialData={link}
        nextOrder={link.displayOrder}
        onSuccess={() => { setEditing(false); onRefresh(); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <>
      <DeleteModal
        isOpen={deleteTarget}
        onClose={() => setDeleteTarget(false)}
        onConfirm={handleDelete}
        itemName={`"${link.label}"`}
      />
      <div className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-100 rounded-xl group hover:border-gray-200 transition-all">
        <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{link.label}</p>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 truncate"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            {link.url}
          </a>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-gray-400 w-6 text-center">#{link.displayOrder}</span>
          {link.isActive ? (
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-gray-300" />
          )}
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(true)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  section,
  onRefresh,
}: {
  section: FooterLinkSection;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingSection, setEditingSection] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(false);

  const handleDeleteSection = async () => {
    await api.delete(`/api/v1/admin/footer-links/sections/${section.id}`);
    onRefresh();
  };

  return (
    <>
      <DeleteModal
        isOpen={deleteTarget}
        onClose={() => setDeleteTarget(false)}
        onConfirm={handleDeleteSection}
        itemName={`section "${section.title}"`}
        description="This will also delete all links inside this section. This action cannot be undone."
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Section Header */}
        {editingSection ? (
          <div className="p-4">
            <SectionForm
              initialData={section}
              nextOrder={section.displayOrder}
              onSuccess={() => { setEditingSection(false); onRefresh(); }}
              onCancel={() => setEditingSection(false)}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
            <button
              onClick={() => setExpanded((p) => !p)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <LayoutList className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {section.title}
                {!section.isActive && (
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    Hidden
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">
                {section.links.length} link{section.links.length !== 1 ? 's' : ''} · order #{section.displayOrder}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setAddingLink(true); setExpanded(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
              <button
                onClick={() => setEditingSection(true)}
                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteTarget(true)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Links List */}
        {expanded && (
          <div className="p-4 space-y-2">
            {section.links.map((link) => (
              <LinkRow key={link.id} link={link} sectionId={section.id} onRefresh={onRefresh} />
            ))}

            {section.links.length === 0 && !addingLink && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Link2 className="w-6 h-6 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No links in this section yet.</p>
                <button
                  onClick={() => setAddingLink(true)}
                  className="mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                >
                  Add the first link
                </button>
              </div>
            )}

            {addingLink && (
              <LinkForm
                sectionId={section.id}
                nextOrder={(section.links.length || 0) + 1}
                onSuccess={() => { setAddingLink(false); onRefresh(); }}
                onCancel={() => setAddingLink(false)}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function FooterLinkManager() {
  const [sections, setSections] = useState<FooterLinkSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingSection, setAddingSection] = useState(false);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/v1/admin/footer-links/sections');
      const data = res.data?.content || res.data?.data || res.data || [];
      setSections(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load footer sections. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Footer Link Sections</h2>
        <button
          onClick={() => setAddingSection(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {/* Add section form */}
      {addingSection && (
        <SectionForm
          nextOrder={(sections.length || 0) + 1}
          onSuccess={() => { setAddingSection(false); fetchSections(); }}
          onCancel={() => setAddingSection(false)}
        />
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-50">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p>Loading footer sections...</p>
          </div>
        </div>
      ) : sections.length === 0 && !addingSection ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <LayoutList className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">No footer sections yet</h3>
          <p className="text-sm text-gray-400 mb-5">
            Create your first section to start organizing footer links.
          </p>
          <button
            onClick={() => setAddingSection(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Create First Section
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} onRefresh={fetchSections} />
          ))}
        </div>
      )}
    </div>
  );
}
