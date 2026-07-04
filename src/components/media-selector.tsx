import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';
import toast from 'react-hot-toast';

interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedAssets: MediaAsset[]) => void;
  multiple?: boolean;
  title?: string;
}

export default function MediaSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  multiple = false,
  title = "Select Media"
}: MediaSelectorProps) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Upload State
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const response = await api.get('/api/v1/admin/media?size=100');
      const data = response.data?.content || response.data?.data?.content || response.data?.data || [];
      // Only show images
      const imagesOnly = (Array.isArray(data) ? data : []).filter(m => m.fileType?.startsWith('image/'));
      setMedia(imagesOnly);
    } catch (err) {
      console.error('Failed to load media', err);
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
    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    
    try {
      await api.post('/api/v1/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Successfully uploaded file!');
      setUploadFile(null);
      await fetchMedia(); 
      setActiveTab('library');
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
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-500" />
            {title}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'library' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Media Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Upload New
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {activeTab === 'library' ? (
            <>
              {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
              <p>Loading your media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ImageIcon className="w-12 h-12 mb-4 text-gray-300" />
              <p>No images found. Please upload some in the Media Library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((asset) => {
                const isSelected = selectedIds.has(asset.id);
                return (
                  <div 
                    key={asset.id}
                    onClick={() => toggleSelection(asset.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${isSelected ? 'border-emerald-500 shadow-md scale-95' : 'border-transparent hover:border-emerald-200'}`}
                  >
                    <img 
                      src={getMediaUrl(asset.fileUrl)} 
                      alt={asset.fileName} 
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-opacity duration-200 ${isSelected ? 'bg-emerald-500/20' : 'bg-black/0 group-hover:bg-black/10'}`}></div>
                    
                    {/* Checkbox Icon */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm transform scale-100 animate-in zoom-in">
                        <Check className="w-3.5 h-3.5 font-bold" />
                      </div>
                    )}
                    
                    {/* Filename banner */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white text-xs truncate drop-shadow-md">{asset.fileName}</p>
                    </div>
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
                  uploadFile ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50'
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
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setUploadFile(e.target.files[0]);
                    }
                  }} 
                  className="hidden" 
                />
                
                {uploadFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-emerald-700 font-medium text-lg">{uploadFile.name}</p>
                    <p className="text-emerald-600/70 text-sm mt-1">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-emerald-600 text-sm mt-4 underline underline-offset-2">Click or drag to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-gray-700 font-medium text-lg">Click to select or drag and drop</p>
                    <p className="text-gray-500 text-sm mt-1">Max 15MB</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                Upload File
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'library' && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {selectedIds.size} item{selectedIds.size !== 1 && 's'} selected
              {!multiple && selectedIds.size > 1 && <span className="text-red-500 ml-2">Please select only 1 item.</span>}
            </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={selectedIds.size === 0 || (!multiple && selectedIds.size > 1)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm Selection
            </button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
