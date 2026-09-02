import React, { useState, useEffect, useId, useRef } from 'react';
import { X, Check, Loader2, Image as ImageIcon, UploadCloud, FileText } from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { Button } from '@/components/ui/button';

interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedAssets: MediaAsset[]) => void;
  multiple?: boolean;
  title?: string;
  /** 'image' (default) shows only images, as a visual grid. 'all' shows every file type, including documents, as a list. */
  accept?: 'image' | 'all';
  /** Tags files uploaded from this modal, so media-library filtering can still
   *  find them (e.g. 'brand' for the site logo, 'headshots' for portraits). */
  uploadCategory?: string;
}

export default function MediaSelector({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  title = "Select Media",
  accept = 'image',
  uploadCategory,
}: MediaSelectorProps) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Upload State
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useFocusTrap(isOpen, dialogRef, onClose);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedIds(new Set()); // Reset selection on open
      setActiveTab('library');
      setUploadFile(null);
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      /* Newest first, explicitly. The endpoint's @PageableDefault sorts by
         createdAt ASC, so `size=100` returned the *oldest* 100 assets — with
         the per-form upload buttons gone, this modal is the only upload path,
         and a freshly uploaded file fell off the end of that window as soon as
         the library passed 100 items. */
      const response = await api.get('/api/v1/admin/media?size=100&sort=createdAt,desc');
      const data = response.data?.content || response.data?.data?.content || response.data?.data || [];
      const all = Array.isArray(data) ? data : [];
      const visible = accept === 'image' ? all.filter(m => m.fileType?.startsWith('image/')) : all;
      setMedia(visible);
      return visible;
    } catch (err) {
      console.error('Failed to load media', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    if (multiple) {
      const newSelection = new Set(selectedIds);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      setSelectedIds(newSelection);
    } else {
      setSelectedIds(new Set([id]));
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    if (uploadFile.size > MAX_UPLOAD_BYTES) {
      toast.error('File size must be less than 15MB.');
      return;
    }
    if (accept === 'image' && !uploadFile.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    if (uploadCategory) formData.append('category', uploadCategory);

    try {
      const res = await api.post('/api/v1/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Successfully uploaded file!');
      setUploadFile(null);

      /* Uploading used to just drop the admin back on an unchanged-looking
         library with nothing selected, so the file they had just added still
         had to be hunted down and clicked. Pre-select it instead — that is the
         only reason they opened this tab. */
      const uploadedId: string | undefined = res.data?.data?.id || res.data?.id;
      const refreshed = await fetchMedia();
      setActiveTab('library');
      if (uploadedId && refreshed.some((m) => m.id === uploadedId)) {
        setSelectedIds((prev) => (multiple ? new Set([...prev, uploadedId]) : new Set([uploadedId])));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    const selectedAssets = media.filter(m => selectedIds.has(m.id));
    onSelect(selectedAssets);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-canvas rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden outline-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <h2 id={titleId} className="text-xl font-bold text-ink flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-green" aria-hidden="true" />
            {title}
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-2 text-muted hover:text-steel rounded-lg hover:bg-surface transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-hairline">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'library' ? 'border-emerald-500 text-brand-green-dark' : 'border-transparent text-steel hover:text-slate hover:border-gray-300'}`}
          >
            Media Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload' ? 'border-emerald-500 text-brand-green-dark' : 'border-transparent text-steel hover:text-slate hover:border-gray-300'}`}
          >
            Upload New
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-soft">
          {activeTab === 'library' ? (
            <>
              {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
              <p>Loading your media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted">
              <ImageIcon className="w-12 h-12 mb-4 text-muted" />
              <p>No {accept === 'image' ? 'images' : 'files'} found. Please upload some in the Media Library.</p>
            </div>
          ) : accept === 'image' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((asset) => {
                const isSelected = selectedIds.has(asset.id);
                return (
                  <div
                    key={asset.id}
                    onClick={() => toggleSelection(asset.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${isSelected ? 'border-emerald-500 shadow-md scale-95' : 'border-transparent hover:border-brand-green/30'}`}
                  >
                    <img
                      src={getMediaUrl(asset.fileUrl)}
                      alt={asset.fileName}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-opacity duration-200 ${isSelected ? 'bg-brand-green/20' : 'bg-black/0 group-hover:bg-black/10'}`}></div>

                    {/* Checkbox Icon */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center text-white dark:text-teal-deep shadow-sm transform scale-100 animate-in zoom-in">
                        <Check className="w-3.5 h-3.5 font-bold" />
                      </div>
                    )}

                    {/* Filename banner */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/70 to-transparent">
                      <p className="text-white text-xs truncate drop-shadow-md">{asset.fileName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {media.map((asset) => {
                const isSelected = selectedIds.has(asset.id);
                const isImage = asset.fileType?.startsWith('image/');
                return (
                  <div
                    key={asset.id}
                    onClick={() => toggleSelection(asset.id)}
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer border-2 transition-all ${isSelected ? 'border-emerald-500 bg-brand-green-soft' : 'border-transparent bg-canvas hover:border-brand-green/30'}`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface flex items-center justify-center shrink-0">
                      {isImage ? (
                        <img src={getMediaUrl(asset.fileUrl)} alt={asset.fileName} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-6 h-6 text-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{asset.fileName}</p>
                      <p className="text-xs text-steel">{asset.fileType || 'Unknown type'}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center text-white dark:text-teal-deep shadow-sm shrink-0">
                        <Check className="w-3.5 h-3.5 font-bold" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto py-10">
              <div 
                className={`w-full border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                  uploadFile ? 'border-emerald-500 bg-brand-green-soft' : 'border-gray-300 hover:border-emerald-500 hover:bg-surface'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setUploadFile(e.dataTransfer.files[0]);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept={accept === 'image' ? 'image/*' : undefined}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setUploadFile(e.target.files[0]);
                    }
                  }} 
                  className="hidden" 
                />
                
                {uploadFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-brand-green-soft text-brand-green-dark rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-brand-green-dark font-medium text-lg">{uploadFile.name}</p>
                    <p className="text-brand-green-dark/70 text-sm mt-1">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-brand-green-dark text-sm mt-4 underline underline-offset-2">Click or drag to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-surface text-muted rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-slate font-medium text-lg">Click to select or drag and drop</p>
                    <p className="text-steel text-sm mt-1">Max 15MB</p>
                  </div>
                )}
              </div>
              
              <Button className="mt-6 w-full" onClick={handleUpload} disabled={!uploadFile || uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                Upload File
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'library' && (
          <div className="px-6 py-4 border-t border-hairline bg-canvas flex items-center justify-between">
            <p className="text-sm text-steel">
              {selectedIds.size} item{selectedIds.size !== 1 && 's'} selected
              {!multiple && selectedIds.size > 1 && <span className="text-red-500 ml-2">Please select only 1 item.</span>}
            </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-slate bg-surface hover:bg-gray-200 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <Button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0 || (!multiple && selectedIds.size > 1)}
            >
              <Check className="w-4 h-4" />
              Confirm Selection
            </Button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
