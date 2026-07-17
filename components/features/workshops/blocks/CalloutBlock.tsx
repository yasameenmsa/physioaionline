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

export function CalloutBlock({ block, isSelected, onSelect, onUpdate }: BlockComponentProps) {
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState(block.attrs?.link || '');
  const calloutStyle = block.attrs?.style || 'info';

  const styleOptions: { value: string; label: string; icon: string; className: string }[] = [
    { value: 'info', label: 'Info', icon: '💡', className: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
    { value: 'warning', label: 'Warning', icon: '⚠️', className: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' },
    { value: 'highlight', label: 'Highlight', icon: '✨', className: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' },
    { value: 'muted', label: 'Muted', icon: '💬', className: 'bg-muted/50 border-border' },
    { value: 'normal', label: 'Normal', icon: '📌', className: 'bg-muted border-border' },
  ];

  const currentStyle = styleOptions.find((s) => s.value === calloutStyle) || styleOptions[0];

  useEffect(() => {
    setLinkUrl(block.attrs?.link || '');
  }, [block.attrs?.link]);

  function saveLink() {
    onUpdate(block.content, { ...block.attrs, link: linkUrl || undefined });
    setShowLink(false);
  }

  return (
    <div className="group/callout">
      <div
        className={`border rounded-lg p-3 ${currentStyle.className}`}
        dir={block.attrs?.dir || 'ltr'}
        style={{ textAlign: block.attrs?.align || 'left' }}
      >
        <textarea
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          onFocus={onSelect}
          placeholder="Callout text..."
          className={cn(
            'w-full bg-transparent border-0 outline-none text-sm resize-none',
            isSelected && 'bg-white/50 dark:bg-black/20 rounded',
            block.attrs?.link && 'text-primary underline decoration-primary/30 hover:decoration-primary'
          )}
          rows={2}
        />
        {isSelected && (
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {styleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(block.content, { ...block.attrs, style: opt.value });
                }}
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] transition-colors',
                  calloutStyle === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/50 dark:bg-black/20 text-muted-foreground hover:text-foreground hover:bg-white/80 dark:hover:bg-black/30'
                )}
                title={opt.label}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
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
          <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
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
              className="flex-1 text-xs bg-white dark:bg-background rounded px-2 py-1 outline-none border border-blue-200 dark:border-blue-800"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
