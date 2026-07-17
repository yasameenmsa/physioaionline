'use client';

import { cn } from '@/lib/utils';
import { TextFormatToolbar } from './TextFormatToolbar';

interface BlockComponentProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
}

export function QuoteBlock({ block, isSelected, onSelect, onUpdate }: BlockComponentProps) {
  return (
    <div className={cn('p-2 rounded', isSelected && 'bg-muted/30')} onClick={onSelect}>
      <div
        className="border-l-4 border-primary pl-4"
        dir={block.attrs?.dir || 'ltr'}
        style={{ textAlign: block.attrs?.align || 'left' }}
      >
        <textarea
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Quote text..."
          className="w-full bg-transparent border-0 outline-none text-sm italic resize-none min-h-[2rem]"
          rows={2}
        />
      </div>
      {isSelected && (
        <div className="flex items-center gap-1 mt-1 px-1">
          <TextFormatToolbar
            align={block.attrs?.align}
            dir={block.attrs?.dir}
            onUpdate={(attrs) => onUpdate(block.content, { ...block.attrs, ...attrs })}
          />
        </div>
      )}
    </div>
  );
}
