'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  itemName?: string;
  description?: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Remove Item?",
  itemName = "this item",
  description = "This will permanently delete and this action cannot be undone.",
}: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setErrorMsg(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirm();
      onClose(); // Automatically close after confirm
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || err?.message || "Failed to delete item. It may be in use by other records.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl w-[90%] max-w-[400px] p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          {title}
        </h2>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-1">
          Are you sure you want to remove {itemName}?
        </p>
        <p className="text-gray-500 text-sm mb-6">
          {description}
        </p>

        {errorMsg && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-6 text-left">
            {(() => {
              // Parse markdown-style links: [Text](url)
              const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
              if (!errorMsg.match(linkRegex)) return errorMsg;
              
              const parts = [];
              let lastIndex = 0;
              let match;
              
              while ((match = linkRegex.exec(errorMsg)) !== null) {
                if (match.index > lastIndex) {
                  parts.push(errorMsg.substring(lastIndex, match.index));
                }
                parts.push(
                  <a 
                    key={match.index} 
                    href={match[2]} 
                    className="underline font-semibold hover:text-red-800"
                  >
                    {match[1]}
                  </a>
                );
                lastIndex = linkRegex.lastIndex;
              }
              
              if (lastIndex < errorMsg.length) {
                parts.push(errorMsg.substring(lastIndex));
              }
              
              return <>{parts}</>;
            })()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-2xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 bg-[#FF3B30] hover:bg-red-600 text-white font-medium rounded-2xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
