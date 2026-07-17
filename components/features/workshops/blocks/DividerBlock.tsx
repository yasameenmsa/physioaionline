'use client';

import { cn } from '@/lib/utils';

interface BlockComponentProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
}

export function DividerBlock({ block, isSelected, onSelect }: BlockComponentProps) {
  return (
    <div
      className={cn('p-2 cursor-pointer', isSelected && 'bg-muted/30 rounded')}
      onClick={onSelect}
    >
      <hr className="border-muted-foreground/30" />
    </div>
  );
}
