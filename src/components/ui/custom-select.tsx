'use client';

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
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
  /** Associates the control with an external <label>, e.g. htmlFor's target. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  disabled = false,
  clearable = false,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const open = useCallback(() => {
    if (disabled || options.length === 0) return;
    setIsOpen(true);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [disabled, options.length, selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  const commitIndex = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    close();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        open();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) commitIndex(activeIndex);
        break;
      case 'Tab':
        close();
        break;
      default:
        break;
    }
  };

  const activeOptionId =
    isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        id={id}
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={activeOptionId}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={disabled ? -1 : 0}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        className={`w-full px-4 py-2.5 bg-canvas border ${
          isOpen ? 'border-brand-green ring-2 ring-brand-green/20' : 'border-hairline-strong'
        } rounded-lg text-ink flex items-center justify-between transition-all outline-none focus-visible:border-brand-green focus-visible:ring-2 focus-visible:ring-brand-green/30 ${
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
              aria-label="Clear selection"
              className="p-1 -m-1 rounded-full hover:bg-surface-soft text-muted hover:text-charcoal transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            aria-hidden="true"
            className={`w-4 h-4 text-charcoal transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-canvas border border-hairline-strong rounded-lg shadow-card max-h-60 overflow-auto">
          <ul id={listboxId} role="listbox" aria-activedescendant={activeOptionId} className="p-2 text-sm font-medium space-y-1">
            {options.length === 0 ? (
              <li role="presentation" className="px-4 py-3 text-steel text-center">
                No options available
              </li>
            ) : (
              options.map((option, index) => (
                <li key={option.value} role="presentation">
                  <div
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={value === option.value}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      index === activeIndex
                        ? 'bg-surface-soft'
                        : value === option.value
                        ? 'bg-brand-green-soft text-brand-green-dark'
                        : 'hover:bg-surface-soft text-ink'
                    } ${value === option.value && index === activeIndex ? 'text-brand-green-dark' : ''}`}
                    onClick={() => commitIndex(index)}
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
