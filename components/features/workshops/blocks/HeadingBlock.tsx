'use client';

import { useState, useEffect } from 'react';
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
}

export function HeadingBlock({ block, isSelected, onSelect, onUpdate }: BlockComponentProps) {
  const level = block.attrs?.level || 2;
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState(block.attrs?.link || '');

  useEffect(() => {
    setLinkUrl(block.attrs?.link || '');
  }, [block.attrs?.link]);

  function saveLink() {
    onUpdate(block.content, { ...block.attrs, link: linkUrl || undefined });
    setShowLink(false);
  }

  const cls =
    level === 1
      ? 'text-2xl font-bold'
      : level === 2
        ? 'text-xl font-semibold'
        : level === 3
          ? 'text-lg font-medium'
          : 'text-base font-medium';

  return (
    <div className="group/heading">
      <input
        type="text"
        value={block.content}
        onChange={(e) => onUpdate(e.target.value)}
        onFocus={onSelect}
        placeholder={`Heading ${level}`}
        dir={block.attrs?.dir || 'ltr'}
        style={{ textAlign: block.attrs?.align || 'left' }}
        className={cn(
          'w-full bg-transparent border-0 outline-none p-1',
          cls,
          isSelected && 'bg-muted/30 rounded',
          block.attrs?.link && 'text-primary underline decoration-primary/30 hover:decoration-primary'
        )}
      />
      {isSelected && (
        <div className="flex items-center gap-1 px-2 pb-1">
          <select
            value={level}
            onChange={(e) =>
              onUpdate(block.content, {
                ...block.attrs,
                level: parseInt(e.target.value) as any,
              })
            }
            className="text-[10px] bg-muted border-0 rounded px-1 py-0.5 outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <option key={l} value={l}>
                H{l}
              </option>
            ))}
          </select>
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
