'use client';

import React from 'react';
import { FolderOpen, X, FileText, ExternalLink } from 'lucide-react';

/**
 * "Pick a file from the media library" widget for non-image assets (PDFs,
 * docs) — mirrors ImageUploadField's shell, but shows a filename + icon
 * instead of an <img> preview, since the selected file usually isn't visually
 * previewable. New files are uploaded from the library modal's own Upload New
 * tab; see the note in ImageUploadField.
 */
export interface DocumentUploadFieldProps {
  fileName: string | null;
  fileUrl: string | null;
  onLibraryClick: () => void;
  onRemoveClick: () => void;
  emptyLabel?: string;
  emptyHint?: string;
}

export default function DocumentUploadField({
  fileName,
  fileUrl,
  onLibraryClick,
  onRemoveClick,
  emptyLabel = 'No document selected',
  emptyHint = 'Choose an existing file from your library, or upload a new one from there.',
}: DocumentUploadFieldProps) {
  if (fileName) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl border border-hairline-strong bg-surface-soft">
        <div className="w-12 h-12 rounded-lg bg-canvas shadow-sm flex items-center justify-center border border-hairline shrink-0">
          <FileText className="w-6 h-6 text-brand-green-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{fileName}</p>
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-green-dark hover:underline mt-0.5"
            >
              View file <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onLibraryClick}
            className="p-2 text-muted hover:text-brand-green-dark hover:bg-brand-green-soft rounded-full transition-colors"
            title="Change Document"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRemoveClick}
            className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Remove Document"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-hairline-strong rounded-lg p-8 flex flex-col items-center justify-center text-center gap-4 bg-surface-soft">
      <div className="w-12 h-12 bg-canvas rounded-full shadow-sm flex items-center justify-center border border-hairline">
        <FileText className="w-6 h-6 text-muted" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink mb-1">{emptyLabel}</p>
        <p className="text-xs text-steel max-w-55 mx-auto">{emptyHint}</p>
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
