'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, Check, X, Globe, Link as LinkIcon } from 'lucide-react';
import api from '@/lib/api';

const PLATFORMS = ['FACEBOOK', 'TWITTER', 'INSTAGRAM', 'YOUTUBE', 'LINKEDIN', 'TIKTOK', 'OTHER'];

export default function SocialMediaManager() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentLink, setCurrentLink] = useState<any>({
    platformName: 'FACEBOOK',
    url: '',
    displayOrder: 0,
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/admin/social-media');
      setLinks(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load social media links.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (link: any) => {
    setCurrentLink(link);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentLink({
      platformName: 'FACEBOOK',
      url: '',
      displayOrder: links.length,
      isActive: true
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      await api.delete(`/api/v1/admin/social-media/${id}`);
      fetchLinks();
    } catch (err) {
      console.error(err);
      alert('Failed to delete link.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (currentLink.id) {
        await api.put(`/api/v1/admin/social-media/${currentLink.id}`, currentLink);
      } else {
        await api.post('/api/v1/admin/social-media', currentLink);
      }
      setIsEditing(false);
      fetchLinks();
    } catch (err) {
      console.error(err);
      alert('Failed to save social media link.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-emerald-500 w-6 h-6" /></div>;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-500" />
          Social Media Links
        </h2>
        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Link
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Platform</label>
              <select
                value={currentLink.platformName}
                onChange={e => setCurrentLink({...currentLink, platformName: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">URL</label>
              <input
                type="url"
                required
                value={currentLink.url}
                onChange={e => setCurrentLink({...currentLink, url: e.target.value})}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Display Order</label>
              <input
                type="number"
                required
                min="0"
                value={currentLink.displayOrder}
                onChange={e => setCurrentLink({...currentLink, displayOrder: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
              />
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentLink.isActive}
                  onChange={e => setCurrentLink({...currentLink, isActive: e.target.checked})}
                  className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-gray-900">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Link
            </button>
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl">Platform</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3 text-center">Order</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {links.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No social media links added yet.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                        {link.platformName}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs truncate text-blue-500 hover:underline">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                    </td>
                    <td className="px-4 py-4 text-center">{link.displayOrder}</td>
                    <td className="px-4 py-4 text-center">
                      {link.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <X className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => handleEdit(link)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors mr-1">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(link.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
