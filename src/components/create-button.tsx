import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateButtonProps {
  href: string;
  className?: string;
}

export default function CreateButton({ href, className = '' }: CreateButtonProps) {
  return (
    <Button href={href} className={`shrink-0 ${className}`}>
      <Plus className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
      <span>Create</span>
    </Button>
  );
}
