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
import toast from 'react-hot-toast';
import DeleteModal from '@/components/delete-modal';
import { Button } from '@/components/ui/button';

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
      <label className="text-xs font-semibold text-steel uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 bg-surface border border-hairline-strong rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
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
        toast.success('Successfully updated footer link!');
      } else {
        await api.post(`/api/v1/admin/footer-links/sections/${sectionId}/links`, payload);
        toast.success('Successfully added footer link!');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save link.');
      toast.error(err.response?.data?.message || 'Failed to save link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-brand-green-soft border border-brand-green/20 rounded-full p-4 space-y-3"
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
                isActive ? 'bg-brand-green' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-canvas rounded-full shadow transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-xs font-medium text-steel">Active</span>
          </label>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="p-2 text-muted hover:text-slate hover:bg-surface rounded-xl transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
          <Button size="sm" type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {initialData ? 'Update' : 'Add Link'}
          </Button>
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
        toast.success('Successfully updated footer section!');
      } else {
        await api.post('/api/v1/admin/footer-links/sections', payload);
        toast.success('Successfully created footer section!');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save section.');
      toast.error(err.response?.data?.message || 'Failed to save section.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-brand-green-soft border border-brand-green/30 rounded-full p-4 space-y-3"
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
              isActive ? 'bg-brand-green' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-canvas rounded-full shadow transition-transform ${
                isActive ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-steel">Active</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="p-2 text-muted hover:text-slate hover:bg-surface rounded-xl transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
          <Button size="sm" type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {initialData ? 'Update Section' : 'Add Section'}
          </Button>
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
    toast.success(`"${link.label}" was deleted.`);
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
      <div className="flex items-center gap-3 px-3 py-2.5 bg-canvas border border-hairline rounded-xl group hover:border-hairline-strong transition-all">
        <GripVertical className="w-3.5 h-3.5 text-muted flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal truncate">{link.label}</p>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-green-dark hover:text-brand-green-dark flex items-center gap-1 truncate"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            {link.url}
          </a>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-muted w-6 text-center">#{link.displayOrder}</span>
          {link.isActive ? (
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-muted" />
          )}
          <button
            onClick={() => setEditing(true)}
            aria-label={`Edit ${link.label}`}
            className="p-1.5 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            onClick={() => setDeleteTarget(true)}
            aria-label={`Delete ${link.label}`}
            className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
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
    toast.success(`Section "${section.title}" was deleted.`);
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

      <div className="bg-canvas rounded-lg border border-hairline shadow-sm overflow-hidden">
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
          <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-hairline">
            <button
              onClick={() => setExpanded((p) => !p)}
              aria-expanded={expanded}
              aria-label={expanded ? `Collapse ${section.title} section` : `Expand ${section.title} section`}
              className="p-1 text-muted hover:text-slate rounded-lg transition-colors"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <LayoutList className="w-4 h-4 text-brand-green flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                {section.title}
                {!section.isActive && (
                  <span className="text-[10px] font-medium text-muted bg-surface px-2 py-0.5 rounded-full">
                    Hidden
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted">
                {section.links.length} link{section.links.length !== 1 ? 's' : ''} · order #{section.displayOrder}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setAddingLink(true); setExpanded(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-green-dark bg-brand-green-soft hover:bg-brand-green-soft rounded-full transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
              <button
                onClick={() => setEditingSection(true)}
                aria-label={`Edit ${section.title} section`}
                className="p-1.5 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setDeleteTarget(true)}
                aria-label={`Delete ${section.title} section`}
                className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
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
                <p className="text-sm text-muted">No links in this section yet.</p>
                <button
                  onClick={() => setAddingLink(true)}
                  className="mt-2 text-xs font-medium text-brand-green-dark hover:text-brand-green-dark underline underline-offset-2"
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

// ─── Footer Preview ──────────────────────────────────────────────────────────

function FooterPreview({ sections }: { sections: FooterLinkSection[] }) {
  const activeSections = sections.filter((s) => s.isActive);

  return (
    <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
      <h3 className="text-sm font-bold text-steel uppercase tracking-wide mb-4">
        Footer Preview
      </h3>
      <div className="bg-gray-900 rounded-xl p-6">
        {activeSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <LayoutList className="w-6 h-6 text-steel mb-2" />
            <p className="text-sm text-steel">No active sections to preview yet.</p>
            <p className="text-xs text-steel mt-1">Add sections and links above to see them here.</p>
          </div>
        ) : (
          <div
            className="grid gap-8"
            style={{ gridTemplateColumns: `repeat(${Math.min(activeSections.length, 4)}, minmax(0, 1fr))` }}
          >
            {activeSections.map((section) => {
              const activeLinks = section.links.filter((l) => l.isActive);
              return (
                <div key={section.id}>
                  <p className="text-sm font-bold text-white mb-3">{section.title}</p>
                  <ul className="space-y-2">
                    {activeLinks.length === 0 ? (
                      <li className="text-xs text-steel italic">No active links</li>
                    ) : (
                      activeLinks.map((link) => (
                        <li key={link.id}>
                          <span className="text-sm text-muted hover:text-gray-200 transition-colors cursor-default">
                            {link.label}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
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
        <h2 className="text-lg font-bold text-ink">Footer Link Sections</h2>
        <Button size="sm" onClick={() => setAddingSection(true)}>
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
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
        <div className="flex items-center justify-center py-16 bg-canvas rounded-lg shadow-sm border border-hairline-soft">
          <div className="flex flex-col items-center gap-3 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
            <p>Loading footer sections...</p>
          </div>
        </div>
      ) : sections.length === 0 && !addingSection ? (
        <div className="flex flex-col items-center justify-center py-20 bg-canvas rounded-lg shadow-sm border border-hairline text-center">
          <div className="w-14 h-14 bg-surface rounded-lg flex items-center justify-center mb-4">
            <LayoutList className="w-7 h-7 text-muted" />
          </div>
          <h3 className="text-base font-semibold text-slate mb-1">No footer sections yet</h3>
          <p className="text-sm text-muted mb-5">
            Create your first section to start organizing footer links.
          </p>
          <Button size="sm" onClick={() => setAddingSection(true)}>
            <Plus className="w-4 h-4" />
            Create First Section
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} onRefresh={fetchSections} />
          ))}
        </div>
      )}

      {/* Live footer preview — always visible once sections exist */}
      {!loading && sections.length > 0 && (
        <FooterPreview sections={sections} />
      )}
    </div>
  );
}
