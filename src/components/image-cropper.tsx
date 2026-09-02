'use client';

import React, { useId, useRef, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { Button } from '@/components/ui/button';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onClose: () => void;
  /**
   * Called when the crop cannot be produced at all. Media may be served from a
   * different origin (getMediaUrl passes absolute S3/CDN URLs through
   * untouched), which taints the canvas and makes toBlob() throw — the caller
   * needs to fall back to using the image uncropped rather than leaving the
   * admin with a button that does nothing.
   */
  onCropUnavailable?: () => void;
}

export default function ImageCropperModal({ imageSrc, onCropComplete, onClose, onCropUnavailable }: ImageCropperModalProps) {
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
      // Same-origin media stays same-origin; a CORS-enabled bucket becomes
      // readable. A bucket without CORS headers fails to load here, which the
      // rejection below turns into the uncropped fallback.
      image.crossOrigin = 'anonymous';
      image.src = imageSrc;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Image could not be loaded for cropping'));
      });

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
        } else {
          onCropUnavailable?.();
        }
      }, 'image/jpeg', 0.95);
    } catch (e) {
      // Cross-origin taint (SecurityError) or a load failure. Either way the
      // crop is impossible here, so hand back to the caller instead of
      // swallowing it and leaving Apply Crop looking broken.
      console.error(e);
      onCropUnavailable?.();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
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
        <div className="relative w-full h-100 bg-black">
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
            <Button size="sm" type="button" onClick={createCroppedImage}>
              <Check className="w-4 h-4" />
              Apply Crop
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
