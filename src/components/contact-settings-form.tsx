'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, MapPin, Mail, Phone, ListChecks, Plus, Trash2, Globe, Clock } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import DeleteModal from '@/components/delete-modal';

interface ContactSettingsFormProps {
  initialData?: any;
}

export default function ContactSettingsForm({ initialData }: ContactSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    physicalAddress: initialData?.physicalAddress || '',
    contactEmail: initialData?.contactEmail || '',
    officeHours: initialData?.officeHours || '',
  });

  // Dynamic Lists State
  const [inquiryTypes, setInquiryTypes] = useState<string[]>(initialData?.inquiryTypes || ['General Inquiry']);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(initialData?.phoneNumbers || []);

  const [deletePhoneIndex, setDeletePhoneIndex] = useState<number | null>(null);
  const [deleteInquiryIndex, setDeleteInquiryIndex] = useState<number | null>(null);

  const handleAddField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const handleRemoveField = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Clean up empty strings
    const cleanInquiryTypes = inquiryTypes.map(t => t.trim()).filter(t => t !== '');
    const cleanPhoneNumbers = phoneNumbers.map(p => p.trim()).filter(p => p !== '');

    if (cleanInquiryTypes.length === 0) {
      setError('You must provide at least one Inquiry Type.');
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      inquiryTypes: cleanInquiryTypes,
      phoneNumbers: cleanPhoneNumbers,
    };

    try {
      if (initialData?.id) {
        await api.put(`/api/v1/admin/contact-settings/${initialData.id}`, payload);
        toast.success('Successfully updated contact settings!');
      } else {
        await api.post('/api/v1/admin/contact-settings', payload);
        toast.success('Successfully saved contact settings!');
      }
      setSuccessMsg('Contact settings updated successfully!');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save settings.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      // Auto dismiss success message
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar with Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Manage Settings</h2>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-primary-deep disabled:opacity-70 text-on-primary font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}
      
      {successMsg && (
        <div className="bg-brand-green-soft text-brand-green-dark p-4 rounded-full border border-brand-green/20 text-sm font-medium">
          {successMsg}
        </div>
      )}

      <DeleteModal
        isOpen={deletePhoneIndex !== null}
        onClose={() => setDeletePhoneIndex(null)}
        onConfirm={() => {
          if (deletePhoneIndex !== null) {
            handleRemoveField(deletePhoneIndex, setPhoneNumbers);
            setDeletePhoneIndex(null);
          }
        }}
        itemName="this phone number"
      />

      <DeleteModal
        isOpen={deleteInquiryIndex !== null}
        onClose={() => setDeleteInquiryIndex(null)}
        onConfirm={() => {
          if (deleteInquiryIndex !== null) {
            handleRemoveField(deleteInquiryIndex, setInquiryTypes);
            setDeleteInquiryIndex(null);
          }
        }}
        itemName="this inquiry type"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: General Contact Info */}
        <div className="space-y-6">
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted" />
              General Contact Info
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Primary Contact Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline-strong rounded-xl text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="contact@kfd.org"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Physical Address</label>
                <textarea
                  rows={4}
                  value={formData.physicalAddress}
                  onChange={(e) => setFormData({...formData, physicalAddress: e.target.value})}
                  className="w-full px-4 py-3 bg-canvas border border-hairline-strong rounded-xl text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="123 Organization Street, City, Country"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Office Hours</label>
                <div className="relative">
                  <div className="absolute top-3.5 left-0 pl-3 flex items-start pointer-events-none">
                    <Clock className="h-5 w-5 text-muted" />
                  </div>
                  <textarea
                    rows={2}
                    value={formData.officeHours}
                    onChange={(e) => setFormData({...formData, officeHours: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline-strong rounded-xl text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="Monday - Friday:&#10;8:00 am - 5:00 pm"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Lists */}
        <div className="space-y-6">
          
          {/* Phone Numbers List */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <Phone className="w-5 h-5 text-muted" />
                Phone Numbers
              </h2>
              <button
                type="button"
                onClick={() => handleAddField(setPhoneNumbers)}
                className="p-2 text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
                title="Add Phone Number"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {phoneNumbers.map((phone, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => handleFieldChange(idx, e.target.value, setPhoneNumbers)}
                    className="flex-1 px-4 py-2.5 bg-surface border border-hairline-strong rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                  <button
                    type="button"
                    onClick={() => setDeletePhoneIndex(idx)}
                    className="p-2.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {phoneNumbers.length === 0 && (
                <p className="text-sm text-steel text-center py-4">No phone numbers added yet.</p>
              )}
            </div>
          </div>

          {/* Inquiry Types List */}
          <div className="bg-canvas rounded-lg p-6 shadow-sm border border-hairline-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-muted" />
                Inquiry Types (Dropdown)
              </h2>
              <button
                type="button"
                onClick={() => handleAddField(setInquiryTypes)}
                className="p-2 text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
                title="Add Inquiry Type"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-steel mb-4">
              These will appear as dropdown options on the public Contact Us form.
            </p>

            <div className="space-y-3">
              {inquiryTypes.map((type, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => handleFieldChange(idx, e.target.value, setInquiryTypes)}
                    required
                    className="flex-1 px-4 py-2.5 bg-surface border border-hairline-strong rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                    placeholder="e.g. General Inquiry, Volunteering"
                  />
                  {inquiryTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeleteInquiryIndex(idx)}
                      className="p-2.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
