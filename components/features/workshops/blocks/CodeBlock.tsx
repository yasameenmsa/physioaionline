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

const LANGUAGES = ['javascript', 'typescript', 'python', 'html', 'css', 'sql', 'json', 'bash', 'plain'];

export function CodeBlock({ block, isSelected, onSelect, onUpdate }: BlockComponentProps) {
  const language = block.attrs?.language || 'plain';

  return (
    <div className={cn('p-2 rounded', isSelected && 'bg-muted/30')} onClick={onSelect}>
      <div className="bg-muted rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b">
          <select
            value={language}
            onChange={(e) => onUpdate(block.content, { ...block.attrs, language: e.target.value })}
            className="text-xs bg-transparent border-0 outline-none text-muted-foreground cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <textarea
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Code..."
          className="w-full bg-transparent border-0 outline-none text-xs font-mono p-3 resize-none min-h-[4rem]"
          rows={4}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
