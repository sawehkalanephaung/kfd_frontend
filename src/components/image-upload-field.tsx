'use client';

import React, { useEffect, useState } from 'react';
import { FolderOpen, X, Image as ImageIcon, ImageOff } from 'lucide-react';

/**
 * Shared visual shell for every "upload an image or pick one from the media
 * library" widget in the admin — originally only implemented on the Post
 * form; Department, Organization Identity, and Team Member each rendered
 * their own version, and two of them (Identity, Team Member) silently
 * dropped the library option entirely. Centralizing the presentation here
 * means the two can't drift apart again.
 *
 * This is intentionally presentational only — the <MediaSelector> modal stays
 * owned by the parent form, since each one has real differences (upload
 * category, cropping).
 *
 * There is deliberately no separate "Upload Image" button: the library modal
 * already carries its own Upload New tab, and the two entry points doing the
 * same job side by side is what made the widget confusing.
 */
export interface ImageUploadFieldProps {
  previewUrl: string | null;
  onLibraryClick: () => void;
  onRemoveClick: () => void;
  alt: string;
  /** 'video' (16:9, for hero/featured-style images) or 'square' (portraits, brand marks). */
  aspect?: 'video' | 'square';
  /** 'cover' fills the frame (photos); 'contain' shows the whole image with padding (logos, which are often non-rectangular or transparent). */
  fit?: 'cover' | 'contain';
  emptyIcon?: React.ReactNode;
  emptyLabel?: string;
  emptyHint?: string;
}

export default function ImageUploadField({
  previewUrl,
  onLibraryClick,
  onRemoveClick,
  alt,
  aspect = 'video',
  fit = 'cover',
  emptyIcon,
  emptyLabel = 'No image selected',
  emptyHint = 'Choose an existing image from your library, or upload a new one from there.',
}: ImageUploadFieldProps) {
  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-video';
  const fitClass = fit === 'contain' ? 'object-contain p-4' : 'object-cover';

  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [previewUrl]);

  if (previewUrl && !broken) {
    return (
      <div className={`relative group ${aspectClass} rounded-xl overflow-hidden border border-hairline-strong bg-surface flex items-center justify-center`}>
        <img
          src={previewUrl}
          alt={alt}
          className={`w-full h-full ${fitClass}`}
          onError={() => setBroken(true)}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onLibraryClick}
            className="bg-canvas text-slate p-3 rounded-full hover:bg-surface hover:scale-110 transition-transform shadow-sm"
            title="Change Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onRemoveClick}
            className="bg-canvas text-red-500 p-3 rounded-full hover:bg-red-50 hover:scale-110 transition-transform shadow-sm"
            title="Remove Image"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-hairline-strong rounded-lg p-8 flex flex-col items-center justify-center text-center gap-4 bg-surface-soft">
      <div className="w-12 h-12 bg-canvas rounded-full shadow-sm flex items-center justify-center border border-hairline">
        {broken ? <ImageOff className="w-6 h-6 text-muted" /> : emptyIcon ?? <ImageIcon className="w-6 h-6 text-muted" />}
      </div>
      <div>
        <p className="text-sm font-medium text-ink mb-1">{broken ? 'Image failed to load' : emptyLabel}</p>
        <p className="text-xs text-steel max-w-55 mx-auto">
          {broken ? 'The stored file may have been moved or deleted. Choose another from your library.' : emptyHint}
        </p>
      </div>
      <div className="flex flex-col w-full gap-2 mt-2">
        <button
          type="button"
          onClick={onLibraryClick}
          className="w-full py-2.5 bg-canvas border border-hairline-strong hover:border-emerald-500 hover:text-brand-green-dark text-slate text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <FolderOpen className="w-4 h-4" />
          Choose from Library
        </button>
      </div>
    </div>
  );
}
