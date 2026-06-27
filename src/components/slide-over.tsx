'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlideOver({ isOpen, onClose, title, children }: SlideOverProps) {
  // Prevent scrolling on the body when the drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div 
          className="pointer-events-auto w-screen max-w-2xl transform transition-transform duration-300 ease-in-out sm:duration-500 translate-x-0"
        >
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            {/* Header */}
            <div className="px-4 py-6 sm:px-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold leading-6 text-gray-900">
                {title}
              </h2>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors p-1"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative flex-1 px-4 py-6 sm:px-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
