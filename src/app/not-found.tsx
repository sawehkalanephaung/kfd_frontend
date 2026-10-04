import type { Metadata } from "next";
import PublicShell from "./(public)/_components/PublicShell";
import NotFoundContent from "./(public)/_components/NotFoundContent";

export const metadata: Metadata = { title: "Page not found" };

/**
 * Unmatched URLs never pass through the (public) layout, so this brings its
 * own header, footer and landmarks. Page-level misses use
 * `(public)/not-found.tsx` instead, which sits inside the layout.
 */
export default function RootNotFound() {
  return (
    <PublicShell>
      <NotFoundContent />
    </PublicShell>
  );
}
