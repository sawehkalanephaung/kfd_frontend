'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useOutsideClick } from '@/lib/use-outside-click';

interface CreatableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  id?: string;
}

/**
 * Free-text input with a filtered dropdown of existing suggestions: pick
 * one, or type a value that isn't in the list to use it as a new one — no
 * separate "create" step, since the caller's underlying field is just a
 * string. Commits on blur, Enter, or clicking a suggestion.
 */
export function CreatableCombobox({
  value,
  onChange,
  suggestions,
  placeholder = 'Select or type to create...',
  className = '',
  id,
}: CreatableComboboxProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useOutsideClick(containerRef, () => setIsOpen(false), isOpen);

  const trimmed = inputValue.trim();
  const filtered = useMemo(() => {
    if (!trimmed) return suggestions;
    return suggestions.filter((s) => s.toLowerCase().includes(trimmed.toLowerCase()));
  }, [trimmed, suggestions]);
  const exactMatch = suggestions.some((s) => s.toLowerCase() === trimmed.toLowerCase());
  const canCreate = trimmed.length > 0 && !exactMatch;

  const commit = (val: string) => {
    setInputValue(val);
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => onChange(inputValue.trim())}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(trimmed);
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-canvas border border-hairline-strong rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
      />

      {isOpen && (filtered.length > 0 || canCreate) && (
        <div className="absolute z-50 w-full mt-1 bg-canvas border border-hairline-strong rounded-lg shadow-card max-h-60 overflow-auto">
          <ul id={listboxId} role="listbox" className="p-2 text-sm font-medium space-y-1">
            {filtered.map((option) => (
              <li key={option} role="presentation">
                <div
                  role="option"
                  aria-selected={value === option}
                  // onMouseDown (not onClick) fires before the input's onBlur,
                  // so preventDefault here keeps focus on the input instead of
                  // letting blur close the dropdown before the click lands.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(option);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    value === option ? 'bg-brand-green-soft text-brand-green-dark' : 'dropdown-row-hover text-ink'
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {value === option && <Check className="w-4 h-4 text-brand-green-dark" />}
                </div>
              </li>
            ))}
            {canCreate && (
              <li role="presentation">
                <div
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(trimmed);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer dropdown-row-hover text-brand-green-dark"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">Create &ldquo;{trimmed}&rdquo;</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
