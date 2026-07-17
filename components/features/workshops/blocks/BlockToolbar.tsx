'use client';

import { Plus, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { workshopBlockLabels, workshopBlockIcons } from '@/lib/workshop-blocks';

interface BlockToolbarProps {
  blockType: string;
  index: number;
  totalBlocks: number;
  onAdd: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function BlockToolbar({
  blockType,
  index,
  totalBlocks,
  onAdd,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: BlockToolbarProps) {
  return (
    <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5">
      <button
        onClick={onAdd}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        title="Add block"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onMoveUp}
        disabled={index === 0}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
        title="Move up"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onMoveDown}
        disabled={index === totalBlocks - 1}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
        title="Move down"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDuplicate}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        title="Duplicate"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="p-1 rounded hover:bg-destructive/10 text-destructive"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
