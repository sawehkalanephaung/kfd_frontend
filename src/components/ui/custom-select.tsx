'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  disabled = false,
  clearable = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full px-4 py-2.5 bg-canvas border ${
          isOpen ? 'border-brand-green ring-2 ring-brand-green/20' : 'border-hairline-strong'
        } rounded-lg text-ink flex items-center justify-between transition-all focus:outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-green/50 cursor-pointer'
        }`}
      >
        <span className={`block truncate ${!selectedOption ? 'text-muted' : 'text-ink'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {clearable && selectedOption && !disabled && (
            <button 
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-surface-soft text-muted hover:text-charcoal transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-charcoal transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-canvas border border-hairline-strong rounded-lg shadow-card max-h-60 overflow-auto">
          <ul className="p-2 text-sm font-medium space-y-1">
            {options.length === 0 ? (
              <li className="px-4 py-3 text-steel text-center">No options available</li>
            ) : (
              options.map((option) => (
                <li key={option.value}>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      value === option.value
                        ? 'bg-brand-green-soft text-brand-green-dark'
                        : 'hover:bg-surface-soft text-ink'
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && <Check className="w-4 h-4 text-brand-green-dark" />}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
