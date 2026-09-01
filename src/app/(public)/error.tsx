'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error boundary for the public site.
 *
 * Rendered when a page throws — most often because the API is unreachable.
 * Previously those failures were caught and turned into notFound(), which told
 * visitors the page did not exist when in fact the content was fine and the
 * backend was down.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Public page error:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] bg-canvas flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-surface-feature">
          <AlertTriangle className="h-7 w-7 text-brand-green-dark" aria-hidden="true" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-3 text-balance">
          We couldn&apos;t load this page
        </h1>

        <p className="text-slate leading-relaxed mb-8">
          Something went wrong while fetching this content. This is usually temporary —
          please try again in a moment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button type="button" onClick={reset}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-hairline-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green-dark focus-visible:ring-offset-2"
          >
            Back to home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-steel">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </main>
  );
}
