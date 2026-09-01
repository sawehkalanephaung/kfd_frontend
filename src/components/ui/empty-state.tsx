import React from 'react';
import { FileQuestion, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export default function EmptyState({ 
  title, 
  description, 
  icon: Icon = FileQuestion,
  actionLabel,
  onAction,
  actionHref
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-surface-soft rounded-full flex items-center justify-center mb-4 border border-hairline-soft shadow-sm">
        <Icon className="w-8 h-8 text-muted" />
      </div>
      <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
      <p className="text-steel text-sm max-w-sm mb-6">{description}</p>
      
      {actionLabel && (
        actionHref ? (
          <Button href={actionHref}>
            <Plus className="w-4 h-4 shrink-0" />
            {actionLabel}
          </Button>
        ) : (
          <Button onClick={onAction}>
            <Plus className="w-4 h-4 shrink-0" />
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
