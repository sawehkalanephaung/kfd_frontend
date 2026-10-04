import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset password (admin)',
  // Staff-only screen: keep it out of search results.
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
