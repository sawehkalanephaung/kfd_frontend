'use client';

import { useId } from 'react';

export interface FormFieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  /** Custom (non-native) controls like CustomSelect aren't "labelable"
   *  elements per the HTML spec, so a plain htmlFor/id pair on them isn't
   *  reliably picked up by assistive tech - pass this through as
   *  aria-labelledby on any control that isn't a native input/textarea/select. */
  'aria-labelledby': string;
}

interface FormFieldProps {
  label: React.ReactNode;
  error?: string;
  required?: boolean;
  /** Helper text shown below the control when there's no error. */
  hint?: React.ReactNode;
  className?: string;
  /** Render-prop so any control (input, textarea, CustomSelect, ...) can
   *  receive the generated id/aria-* wiring without FormField needing to
   *  know its shape - spread the returned props onto it. */
  children: (fieldProps: FormFieldControlProps) => React.ReactNode;
}

/**
 * Shared label + control + hint/error wrapper. Every one of the 13 admin
 * *-form.tsx components hand-rolled this block independently, and none of
 * them associated the label with its input via htmlFor/id (72 fields
 * total) - the same gap fixed one-off on the auth pages in an earlier
 * commit, just not yet caught here. See UI_ACCESSIBILITY_AUDIT §3.
 */
export function FormField({ label, error, required, hint, className = '', children }: FormFieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      <label
        id={labelId}
        htmlFor={id}
        // htmlFor only auto-focuses natively-labelable elements (input,
        // textarea, select, button...) on click - CustomSelect's trigger
        // is a <div role="combobox"> that doesn't qualify, so this covers
        // it too without affecting native inputs (redundant but harmless
        // there, since the browser already focuses them itself).
        onClick={() => document.getElementById(id)?.focus()}
        className="block text-sm font-semibold text-ink mb-2"
      >
        {label}
        {required && (
          <span className="text-danger-text ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-describedby': error ? errorId : hint ? hintId : undefined,
        'aria-invalid': error ? true : undefined,
        'aria-labelledby': labelId,
      })}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger-text mt-1.5">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-steel mt-1.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
