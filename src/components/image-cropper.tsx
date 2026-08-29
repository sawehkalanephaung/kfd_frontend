'use client';

import React, { useId, useRef, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import { useFocusTrap } from '@/lib/use-focus-trap';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onClose: () => void;
}

export default function ImageCropperModal({ imageSrc, onCropComplete, onClose }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // The parent conditionally mounts this component to show/hide it, so
  // "mounted" is "open" - pass a constant true rather than an isOpen prop.
  useFocusTrap(true, dialogRef, onClose);

  const onCropChange = (crop: any) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      const image = new Image();
      image.src = imageSrc;
      await new Promise(resolve => (image.onload = resolve));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      }, 'image/jpeg', 0.95);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative bg-canvas rounded-lg w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 outline-none"
      >

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-hairline bg-surface-soft">
          <div>
            <h3 id={titleId} className="text-lg font-bold text-ink">Crop Headshot</h3>
            <p className="text-sm text-steel">Position the image inside the square.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-[400px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square aspect ratio
            cropShape="rect"
            showGrid={true}
            onCropChange={onCropChange}
            onCropComplete={handleCropComplete}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Controls & Actions */}
        <div className="p-4 bg-canvas border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-1/2">
            <span className="text-xs text-steel font-medium">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate bg-canvas border border-hairline-strong hover:bg-surface hover:text-ink rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createCroppedImage}
              className="inline-flex items-center gap-2 px-5 py-2 bg-brand-green hover:bg-primary-deep text-on-primary text-sm font-medium rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95"
            >
              <Check className="w-4 h-4" />
              Apply Crop
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
