import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface CreateButtonProps {
  href: string;
  className?: string;
}

export default function CreateButton({ href, className = '' }: CreateButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-primary-deep text-on-primary font-semibold rounded-full transition-all shadow-sm shadow-brand-green/20 active:scale-95 shrink-0 whitespace-nowrap text-[14px] ${className}`}
    >
      <Plus className="w-5 h-5 shrink-0" />
      <span>Create</span>
    </Link>
  );
}
