'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error boundary for the admin dashboard.
 *
 * Keeps a failed API call inside the dashboard shell instead of dropping the
 * administrator onto Next's default error screen.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-surface-feature">
          <AlertTriangle className="h-6 w-6 text-brand-green-dark" aria-hidden="true" />
        </div>

        <h1 className="text-xl font-bold text-ink mb-2">Something went wrong</h1>

        <p className="text-sm text-slate leading-relaxed mb-6">
          This screen failed to load. The server may be unreachable — retrying often
          resolves it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button type="button" onClick={reset}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-hairline-strong px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green-dark focus-visible:ring-offset-2"
          >
            Back to dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-steel">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  );
}
