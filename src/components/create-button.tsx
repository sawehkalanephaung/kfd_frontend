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
      className={`group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-primary-deep text-on-primary font-semibold rounded-full transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-brand-green/30 hover:-translate-y-0.5 active:scale-95 shrink-0 whitespace-nowrap text-[14px] ${className}`}
    >
      <Plus className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
      <span>Create</span>
    </Link>
  );
}
