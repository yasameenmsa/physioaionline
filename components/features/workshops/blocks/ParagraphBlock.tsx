'use client';

import { useRef, useEffect, useState } from 'react';
import { Link2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextFormatToolbar } from './TextFormatToolbar';

interface BlockComponentProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
  onPasteBlocks?: (text: string) => void;
  onReplaceBlock?: (text: string) => void;
}

export function ParagraphBlock({ block, isSelected, onSelect, onUpdate, onAddAfter, onPasteBlocks, onReplaceBlock }: BlockComponentProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState(block.attrs?.link || '');

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [block.content]);

  useEffect(() => {
    setLinkUrl(block.attrs?.link || '');
  }, [block.attrs?.link]);

  function saveLink() {
    onUpdate(block.content, { ...block.attrs, link: linkUrl || undefined });
    setShowLink(false);
  }

  return (
    <div className="group/para">
      <textarea
        ref={ref}
        value={block.content}
        onChange={(e) => onUpdate(e.target.value)}
        onFocus={onSelect}
        placeholder="Type something, or / for commands..."
        dir={block.attrs?.dir || 'ltr'}
        style={{ textAlign: block.attrs?.align || 'left' }}
        className={cn(
          'w-full resize-none bg-transparent border-0 outline-none text-sm leading-relaxed p-2 rounded min-h-[2rem]',
          'placeholder:text-muted-foreground/50',
          isSelected && 'bg-muted/30',
          block.attrs?.link && 'text-primary underline decoration-primary/30 hover:decoration-primary'
        )}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onAddAfter('paragraph');
          }
        }}
        onPaste={(e) => {
          if (!block.content.trim() && onReplaceBlock) {
            const text = e.clipboardData.getData('text/plain');
            if (text && text.trim().includes('\n')) {
              e.preventDefault();
              onReplaceBlock(text);
            }
          }
        }}
      />
      {isSelected && (
        <div className="flex items-center gap-1 px-2 pb-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLink(!showLink);
            }}
            className={cn(
              'p-1 rounded text-xs transition-colors',
              block.attrs?.link
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            title="Add link"
          >
            <Link2 className="h-3 w-3" />
          </button>
          {block.attrs?.link && (
            <a
              href={block.attrs.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Open link"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <TextFormatToolbar
            align={block.attrs?.align}
            dir={block.attrs?.dir}
            onUpdate={(attrs) => onUpdate(block.content, { ...block.attrs, ...attrs })}
          />
        </div>
      )}
      {showLink && (
        <div className="px-2 pb-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Link2 className="h-3 w-3 text-muted-foreground shrink-0" />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveLink();
              if (e.key === 'Escape') setShowLink(false);
            }}
            onBlur={saveLink}
            placeholder="https://example.com"
            className="flex-1 text-xs bg-muted rounded px-2 py-1 outline-none"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
