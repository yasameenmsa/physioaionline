'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, GripVertical, Trash2,
  AlignLeft, AlignCenter, AlignRight,
  Palette, Code, ClipboardPaste, FileCode, Upload, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Block, BlockType, BlockAttrs } from '@/lib/blocks';
import { createBlock, blockLabels, blockIcons, blocksFromMarkdown, blocksFromHtml } from '@/lib/blocks';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

const blockTypeOptions: { type: BlockType; icon: string }[] = [
  { type: 'paragraph', icon: 'P' },
  { type: 'heading', icon: 'H' },
  { type: 'image', icon: '🖼' },
  { type: 'youtube', icon: '▶' },
  { type: 'quote', icon: '"' },
  { type: 'code', icon: '</>' },
  { type: 'list', icon: '≡' },
  { type: 'divider', icon: '—' },
  { type: 'columns', icon: '⫼' },
  { type: 'callout', icon: '💬' },
  { type: 'toggle', icon: '▶' },
  { type: 'table', icon: '▦' },
  { type: 'file', icon: '📎' },
  { type: 'quiz', icon: '❓' },
];

const styleOptions = [
  { value: 'normal' as const, label: 'Normal' },
  { value: 'muted' as const, label: 'Muted' },
  { value: 'highlight' as const, label: 'Highlight' },
  { value: 'info' as const, label: 'Info' },
  { value: 'warning' as const, label: 'Warning' },
];

const calloutStyleOptions = [
  { value: 'info' as const, label: 'Info' },
  { value: 'warning' as const, label: 'Warning' },
  { value: 'success' as const, label: 'Success' },
  { value: 'highlight' as const, label: 'Highlight' },
  { value: 'muted' as const, label: 'Muted' },
  { value: 'normal' as const, label: 'Normal' },
];

function BlockTypeSelector({ onSelect }: { onSelect: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1 text-xs h-7 px-2"
        onClick={() => setOpen(!open)}
      >
        <Plus className="h-3 w-3" />
        Block
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute ltr:left-0 rtl:right-0 top-full mt-1 z-20 w-44 rounded-lg border bg-popover p-1.5 shadow-lg">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Add Block</p>
            {blockTypeOptions.map((opt) => (
              <button
                key={opt.type}
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                onClick={() => { setOpen(false); onSelect(opt.type); }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-mono">
                  {opt.icon}
                </span>
                {blockLabels[opt.type]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StyleToolbar({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}) {
  const [showStyle, setShowStyle] = useState(false);

  const supportsAlign = ['paragraph', 'heading', 'callout'].includes(block.type);
  const supportsStyle = block.type === 'paragraph';
  const supportsDir = ['paragraph', 'heading', 'quote', 'callout'].includes(block.type);
  const supportsCalloutStyle = block.type === 'callout';
  const supportsHeadingLevel = block.type === 'heading';

  return (
    <div className="flex items-center gap-0.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
      {supportsAlign && (
        <div className="flex items-center">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => onUpdate({ attrs: { ...block.attrs, align: block.attrs?.align === align ? undefined : align } })}
              className={cn(
                'p-1 rounded transition-colors',
                block.attrs?.align === align || (!block.attrs?.align && align === 'left')
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {align === 'left' && <AlignLeft className="h-3 w-3" />}
              {align === 'center' && <AlignCenter className="h-3 w-3" />}
              {align === 'right' && <AlignRight className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}

      {supportsAlign && (supportsStyle || supportsDir || supportsHeadingLevel || supportsCalloutStyle) && (
        <div className="w-px h-3 bg-muted-foreground/20" />
      )}

      {supportsHeadingLevel && (
        <div className="flex items-center">
          {([1, 2, 3, 4, 5, 6] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onUpdate({ attrs: { ...block.attrs, level } })}
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors',
                block.attrs?.level === level
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              H{level}
            </button>
          ))}
        </div>
      )}

      {supportsHeadingLevel && (supportsStyle || supportsDir) && (
        <div className="w-px h-3 bg-muted-foreground/20" />
      )}

      {supportsStyle && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStyle(!showStyle)}
            className={cn(
              'p-1 rounded transition-colors',
              block.attrs?.style
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Palette className="h-3 w-3" />
          </button>
          {showStyle && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStyle(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-32 rounded-lg border bg-popover p-1 shadow-lg">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      'flex w-full items-center rounded-md px-2 py-1 text-xs hover:bg-accent transition-colors',
                      block.attrs?.style === opt.value || (!block.attrs?.style && opt.value === 'normal') ? 'bg-accent' : ''
                    )}
                    onClick={() => {
                      onUpdate({ attrs: { ...block.attrs, style: opt.value === 'normal' ? undefined : opt.value } });
                      setShowStyle(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {supportsCalloutStyle && (
        <div className="flex items-center gap-0.5">
          {calloutStyleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onUpdate({ attrs: { ...block.attrs, style: opt.value } })}
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors',
                block.attrs?.style === opt.value
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {supportsDir && (
        <>
          <div className="w-px h-3 bg-muted-foreground/20" />
          <button
            type="button"
            onClick={() => onUpdate({ attrs: { ...block.attrs, dir: block.attrs?.dir === 'rtl' ? 'ltr' : 'rtl' } })}
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors',
              block.attrs?.dir === 'rtl'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {block.attrs?.dir === 'rtl' ? 'RTL' : 'LTR'}
          </button>
        </>
      )}
    </div>
  );
}

function SortableBlock({
  block,
  index,
  total,
  focusedBlockId,
  edgeTarget,
  onUpdate,
  onRemove,
  onSetFocus,
  addChildBlock,
  removeChildBlock,
  updateChildBlock,
}: {
  block: Block;
  index: number;
  total: number;
  focusedBlockId: string | null;
  edgeTarget?: 'left' | 'right' | null;
  onUpdate: (updates: Partial<Block>) => void;
  onRemove: () => void;
  onSetFocus: () => void;
  addChildBlock: (afterChildIndex?: number) => void;
  removeChildBlock: (childIndex: number) => void;
  updateChildBlock: (childIndex: number, updates: Partial<Block>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isFocused = focusedBlockId === block.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      className={cn(
        'group relative rounded-lg border transition-colors',
        isDragging && 'opacity-30 z-50',
        isFocused ? 'border-primary/40 bg-muted/20' : 'border-transparent hover:border-border/50'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSetFocus();
      }}
    >
      {edgeTarget === 'left' && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-full z-30 pointer-events-none" />
      )}
      {edgeTarget === 'right' && (
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-full z-30 pointer-events-none" />
      )}
      <div className="flex items-start gap-1 px-2 py-1.5">
        <button
          className={cn(
            'mt-1.5 p-1 rounded cursor-grab active:cursor-grabbing shrink-0 border border-dashed transition-opacity',
            isFocused
              ? 'border-muted-foreground/40 text-muted-foreground hover:text-foreground hover:bg-muted opacity-100'
              : 'border-muted-foreground/20 text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:border-muted-foreground/40 hover:text-foreground hover:bg-muted'
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </button>

        <div className="flex-1 min-w-0">
          {isFocused && (
            <div className="mb-1 pt-0.5">
              <StyleToolbar block={block} onUpdate={onUpdate} />
            </div>
          )}
          {renderBlockContent(block, index, onUpdate, isFocused, addChildBlock, removeChildBlock, updateChildBlock)}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            'mt-1.5 p-1 rounded shrink-0 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30',
            isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function renderBlockContent(
  block: Block,
  index: number,
  onUpdate: (updates: Partial<Block>) => void,
  isFocused: boolean,
  addChildBlock: (afterChildIndex?: number) => void,
  removeChildBlock: (childIndex: number) => void,
  updateChildBlock: (childIndex: number, updates: Partial<Block>) => void
) {
  const dir = block.attrs?.dir || 'ltr';
  const align = block.attrs?.align || 'left';

  const styleClasses: Record<string, string> = {
    muted: 'text-muted-foreground italic',
    highlight: 'bg-primary/5 rounded-lg px-4 py-3',
    info: 'bg-blue-50 dark:bg-blue-950/30 rounded-lg px-4 py-3 text-blue-700 dark:text-blue-300',
    warning: 'bg-amber-50 dark:bg-amber-950/30 rounded-lg px-4 py-3 text-amber-700 dark:text-amber-300',
  };

  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : '';
  const styleClass = block.attrs?.style ? styleClasses[block.attrs.style] || '' : '';

  switch (block.type) {
    case 'heading': {
      const level = block.attrs?.level || 2;
      const Tag = `h${level}` as React.ElementType;
      const sizes: Record<number, string> = {
        1: 'text-3xl font-bold mt-6 mb-3',
        2: 'text-2xl font-bold mt-5 mb-2',
        3: 'text-xl font-semibold mt-4 mb-2',
        4: 'text-lg font-semibold mt-3 mb-1',
        5: 'text-base font-semibold mt-2 mb-1',
        6: 'text-sm font-semibold mt-2 mb-1',
      };
      return (
        <Tag className={cn(sizes[level] || 'text-sm font-semibold mt-2 mb-1', alignClass)} dir={dir}>
          {isFocused ? (
            <div className="space-y-1">
              <Input
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter heading..."
                className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ fontSize: level <= 2 ? '1.5rem' : level <= 4 ? '1.125rem' : '0.875rem' }}
                autoFocus
              />
              <Input
                value={block.attrs?.link || ''}
                onChange={(e) => onUpdate({ attrs: { ...block.attrs, link: e.target.value } })}
                placeholder="Link URL (optional)"
                className="text-xs border-0 px-0 focus-visible:ring-0 text-muted-foreground"
              />
            </div>
          ) : block.attrs?.link ? (
            <a href={block.attrs.link} className="hover:underline">{block.content || <span className="text-muted-foreground">Empty heading</span>}</a>
          ) : (
            block.content || <span className="text-muted-foreground">Empty heading</span>
          )}
        </Tag>
      );
    }

    case 'paragraph':
      return isFocused ? (
        <div className="space-y-1">
          <Textarea
            value={block.content}
            onChange={(e) => {
              onUpdate({ content: e.target.value });
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const lines = block.content.split('\n');
                const lastLine = lines[lines.length - 1] || '';
                if (lastLine.trim() === '' && lines.length > 1) {
                  onUpdate({ content: lines.slice(0, -1).join('\n') });
                } else {
                  onUpdate({ content: block.content + '\n' });
                }
              }
            }}
            placeholder="Type your content here..."
            className={cn(
              'min-h-[80px] border-0 px-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0',
              alignClass,
              styleClass
            )}
            dir={dir}
            autoFocus
            ref={(el) => {
              if (el) {
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
          />
          <Input
            value={block.attrs?.link || ''}
            onChange={(e) => onUpdate({ attrs: { ...block.attrs, link: e.target.value } })}
            placeholder="Link URL (optional)"
            className="text-xs border-0 px-0 focus-visible:ring-0 text-muted-foreground"
          />
        </div>
      ) : (
        <p className={cn('mb-2 leading-relaxed min-h-[1.5rem]', alignClass, styleClass)} dir={dir}>
          {block.attrs?.link ? (
            <a href={block.attrs.link} className="text-primary underline hover:no-underline">
              {block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground">Empty paragraph</span>}
            </a>
          ) : block.content ? (
            renderInlineMarkdown(block.content)
          ) : (
            <span className="text-muted-foreground">Empty paragraph</span>
          )}
        </p>
      );

    case 'image': {
      const fitOptions = ['cover', 'contain', 'fill', 'none'] as const;
      return (
        <div className="space-y-2">
          {isFocused ? (
            <>
              <div className="flex items-center gap-2">
                <Input
                  value={block.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder="Paste image URL..."
                  className="font-mono text-sm flex-1"
                />
                <FileUploadButton
                  onUpload={(url) => onUpdate({ content: url })}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  label="Upload"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={block.attrs?.alt || ''}
                  onChange={(e) => onUpdate({ attrs: { ...block.attrs, alt: e.target.value } })}
                  placeholder="Alt text"
                  className="text-sm"
                />
                <div className="flex items-center gap-1">
                  {fitOptions.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({ attrs: { ...block.attrs, fit: f === 'cover' ? undefined : f } });
                      }}
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded border transition-colors',
                        (block.attrs?.fit || 'cover') === f ? 'bg-primary/10 border-primary/30 text-primary' : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                value={block.attrs?.caption || ''}
                onChange={(e) => onUpdate({ attrs: { ...block.attrs, caption: e.target.value } })}
                placeholder="Image caption (optional)"
                className="text-sm"
              />
            </>
          ) : null}
          {block.content && (
            <figure className="space-y-1">
              <div className="rounded-lg border overflow-hidden max-w-md">
                <img
                  src={block.content}
                  alt={block.attrs?.alt || 'Article image'}
                  className={cn(
                    'w-full h-auto max-h-64',
                    block.attrs?.fit === 'contain' && 'object-contain',
                    block.attrs?.fit === 'fill' && 'object-fill',
                    block.attrs?.fit === 'none' && 'object-none',
                    (!block.attrs?.fit || block.attrs?.fit === 'cover') && 'object-cover'
                  )}
                  loading="lazy"
                />
              </div>
              {block.attrs?.caption && <figcaption className="text-center text-sm text-muted-foreground">{block.attrs.caption}</figcaption>}
            </figure>
          )}
          {!block.content && !isFocused && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Image block (click to edit)
            </div>
          )}
        </div>
      );
    }

    case 'youtube':
      return (
        <div className="space-y-2">
          {isFocused ? (
            <Input
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Paste YouTube URL..."
              className="font-mono text-sm"
              autoFocus
            />
          ) : null}
          {isFocused && block.content ? (
            <Input
              value={block.attrs?.caption || ''}
              onChange={(e) => onUpdate({ attrs: { ...block.attrs, caption: e.target.value } })}
              placeholder="Video caption (optional)"
              className="text-sm"
            />
          ) : null}
          {block.content ? (
            <div className="space-y-1">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={getYoutubeEmbedUrl(block.content)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              {block.attrs?.caption && <p className="text-center text-sm text-muted-foreground">{block.attrs.caption}</p>}
            </div>
          ) : !isFocused ? (
            <div className="aspect-video rounded-lg border border-dashed flex items-center justify-center text-sm text-muted-foreground">
              YouTube embed (click to add URL)
            </div>
          ) : null}
        </div>
      );

    case 'quote':
      return (
        <blockquote className={cn('my-2 pl-6 border-l-4 border-primary/40', alignClass)} dir={dir}>
          {isFocused ? (
            <Textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Enter quote..."
              className="min-h-[60px] border-0 px-0 resize-none italic text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          ) : (
            <p className="italic text-muted-foreground">{block.content || <span className="text-muted-foreground/50">Empty quote</span>}</p>
          )}
        </blockquote>
      );

    case 'code':
      return (
        <div className="space-y-1">
          {isFocused && (
            <Input
              value={block.attrs?.language || ''}
              onChange={(e) => onUpdate({ attrs: { ...block.attrs, language: e.target.value } })}
              placeholder="language (e.g. javascript, python)..."
              className="w-48 text-xs font-mono"
            />
          )}
          {isFocused ? (
            <Textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="// Your code here..."
              className="min-h-[120px] font-mono text-sm bg-muted border-muted-foreground/20 focus-visible:ring-0"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
              autoFocus
            />
          ) : (
            <pre className="rounded-lg bg-muted p-4 overflow-x-auto text-sm font-mono leading-relaxed">
              <code>{block.content || '// Empty code block'}</code>
            </pre>
          )}
        </div>
      );

    case 'list': {
      const items = block.content.split('\n');
      const ListTag = block.attrs?.listType === 'ordered' ? 'ol' : 'ul';
      return (
        <div className="space-y-1" dir={dir}>
          <div className="flex items-center gap-1">
            {isFocused && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ attrs: { ...block.attrs, listType: block.attrs?.listType === 'ordered' ? 'unordered' : 'ordered' } });
                  }}
                  className={`text-xs px-2 py-1 rounded border ${block.attrs?.listType === 'ordered' ? 'bg-primary/10 border-primary/30 text-primary' : 'text-muted-foreground'}`}
                >
                  {block.attrs?.listType === 'ordered' ? '1. Ordered' : '- Unordered'}
                </button>
                <div className="w-px h-3 bg-muted-foreground/20" />
              </>
            )}
          </div>
          {isFocused ? (
            <div className="space-y-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-1 group/item">
                  <span className="text-xs text-muted-foreground w-4 text-right shrink-0">
                    {block.attrs?.listType === 'ordered' ? `${i + 1}.` : '•'}
                  </span>
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[i] = e.target.value;
                      onUpdate({ content: newItems.join('\n') });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newItems = [...items];
                        newItems.splice(i + 1, 0, '');
                        onUpdate({ content: newItems.join('\n') });
                      } else if (e.key === 'Backspace' && item === '' && items.length > 1) {
                        e.preventDefault();
                        const newItems = items.filter((_, j) => j !== i);
                        onUpdate({ content: newItems.join('\n') });
                      }
                    }}
                    placeholder={`Item ${i + 1}`}
                    className="text-sm border-0 px-0 focus-visible:ring-0 min-h-0 h-7"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newItems = items.filter((_, j) => j !== i);
                        onUpdate({ content: newItems.join('\n') });
                      }}
                      className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ content: [...items, ''].join('\n') });
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1"
              >
                <Plus className="h-3 w-3" /> Add item
              </button>
            </div>
          ) : (
            <ListTag className={cn('space-y-1 pl-6', block.attrs?.listType === 'ordered' ? 'list-decimal' : 'list-disc')}>
              {items.filter(Boolean).length > 0 ? items.filter(Boolean).map((item, i) => <li key={i} className="text-sm">{renderInlineMarkdown(item)}</li>) : <li className="text-muted-foreground text-sm">Empty list</li>}
            </ListTag>
          )}
        </div>
      );
    }

    case 'divider':
      return (
        <div className="py-2">
          <hr className="my-2" />
        </div>
      );

    case 'callout': {
      const calloutStyles: Record<string, string> = {
        info: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
        warning: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
        success: 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300',
        highlight: 'border-primary bg-primary/5',
        muted: 'border-muted-foreground/30 bg-muted/30 text-muted-foreground',
        normal: 'border-border bg-background',
      };
      const styleClass = calloutStyles[block.attrs?.style || 'info'] || calloutStyles.info;
      return (
        <div className={cn('my-2 rounded-lg border-l-4 px-4 py-3', styleClass)} dir={dir}>
          {isFocused ? (
            <div className="space-y-2">
              <Input
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Callout message..."
                className="font-medium border-0 bg-transparent px-0 focus-visible:ring-0"
                autoFocus
              />
              <Input
                value={block.attrs?.link || ''}
                onChange={(e) => onUpdate({ attrs: { ...block.attrs, link: e.target.value } })}
                placeholder="Link URL (optional)"
                className="text-sm border-0 bg-transparent px-0 focus-visible:ring-0"
              />
            </div>
          ) : (
            <>
              <p className="font-medium">{renderInlineMarkdown(block.content) || <span className="opacity-50">Empty callout</span>}</p>
              {block.attrs?.link && (
                <a href={block.attrs.link} className="text-sm underline mt-1 inline-block opacity-80 hover:opacity-100">Learn more →</a>
              )}
            </>
          )}
        </div>
      );
    }

    case 'toggle':
      return (
        <div className="my-2 rounded-lg border" dir={dir}>
          <div className="px-4 py-3 flex items-center gap-2">
            <span className="text-muted-foreground text-sm">▶</span>
            {isFocused ? (
              <Input
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Toggle title..."
                className="font-medium border-0 px-0 focus-visible:ring-0 flex-1"
                autoFocus
              />
            ) : (
              <p className="font-medium flex-1">{block.content || <span className="text-muted-foreground">Toggle section</span>}</p>
            )}
          </div>
          <div className="px-4 pb-3 border-t">
            {(block.children || []).length > 0 ? (
              block.children!.map((child, ci) => (
                <div key={child.id} className="py-1 text-sm group/toggle-item">
                  {isFocused ? (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground shrink-0">
                        {blockIcons[child.type]}
                      </div>
                      <Input
                        value={child.content}
                        onChange={(e) => updateChildBlock(ci, { content: e.target.value })}
                        placeholder={`${blockLabels[child.type]}...`}
                        className="text-sm border-0 px-0 focus-visible:ring-0 min-h-0 h-7"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeChildBlock(ci); }}
                        className="opacity-0 group-hover/toggle-item:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1">
                      <span className="text-muted-foreground text-xs shrink-0 mt-0.5">{blockIcons[child.type]}</span>
                      {child.type === 'heading' ? (
                        <p className="font-medium">{child.content}</p>
                      ) : child.type === 'code' ? (
                        <pre className="text-xs bg-muted rounded p-1 font-mono">{child.content}</pre>
                      ) : child.type === 'quote' ? (
                        <p className="italic text-muted-foreground border-l-2 pl-2">{child.content}</p>
                      ) : child.type === 'divider' ? (
                        <hr className="w-full my-1" />
                      ) : child.type === 'list' ? (
                        <ul className="list-disc pl-4 text-sm">
                          {child.content.split('\n').filter(Boolean).map((item, i) => <li key={i}>{renderInlineMarkdown(item)}</li>)}
                        </ul>
                      ) : (
                        <p>{renderInlineMarkdown(child.content)}</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm py-1">No content</p>
            )}
            {isFocused && (
              <div className="flex items-center gap-1 mt-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); addChildBlock(); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
                <div className="relative group/addtype">
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ▾
                  </button>
                  <div className="absolute left-0 top-full mt-0.5 z-30 hidden group-hover/addtype:block w-36 rounded-lg border bg-popover p-1 shadow-lg">
                    {blockTypeOptions.slice(0, 8).map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newChild = createBlock(opt.type);
                          const children = block.children || [];
                          const updatedChildren = [...children, { ...newChild, id: `child-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }];
                          onUpdate({ children: updatedChildren });
                        }}
                      >
                        <span className="w-4 text-center font-mono">{opt.icon}</span>
                        {blockLabels[opt.type]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case 'columns': {
      const widths = block.attrs?.widths || [50, 50];
      const cols = block.children || [];

      function makeColumnBlock(existing?: Block): Block {
        return {
          id: existing?.id || `column-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'paragraph',
          content: '',
          children: existing?.children && existing.children.length > 0
            ? existing.children
            : [createBlock('paragraph')],
        };
      }

      function updateColumnInner(colIndex: number, innerIndex: number, updates: Partial<Block>) {
        const newCols = cols.map((col, i) => {
          if (i !== colIndex) return col;
          const innerChildren = (col.children || []).map((c, j) => j === innerIndex ? { ...c, ...updates } : c);
          return { ...col, children: innerChildren };
        });
        onUpdate({ children: newCols });
      }

      function addColumnInner(colIndex: number, type?: BlockType) {
        const newCols = cols.map((col, i) => {
          if (i !== colIndex) return col;
          return { ...col, children: [...(col.children || []), createBlock(type || 'paragraph')] };
        });
        onUpdate({ children: newCols });
      }

      function removeColumnInner(colIndex: number, innerIndex: number) {
        const newCols = cols.map((col, i) => {
          if (i !== colIndex) return col;
          const filtered = (col.children || []).filter((_, j) => j !== innerIndex);
          return { ...col, children: filtered.length > 0 ? filtered : [createBlock('paragraph')] };
        });
        onUpdate({ children: newCols });
      }

      function updateColumnWidth(colIndex: number, newWidth: number) {
        const newWidths = [...widths];
        const diff = newWidth - (newWidths[colIndex] || 0);
        newWidths[colIndex] = newWidth;
        if (newWidths.length > 1) {
          const nextIdx = (colIndex + 1) % newWidths.length;
          newWidths[nextIdx] = (newWidths[nextIdx] || 50) - diff;
          if (newWidths[nextIdx] < 10) {
            newWidths[colIndex] = newWidth - (10 - newWidths[nextIdx]);
            newWidths[nextIdx] = 10;
          }
        }
        onUpdate({ attrs: { ...block.attrs, widths: newWidths } });
      }

      return (
        <div className="my-2 rounded-lg border p-2" dir={dir}>
          <div className="flex items-center gap-1 mb-2">
            {isFocused && (
              <>
                {([2, 3, 4] as const).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newCols = Array.from({ length: count }, (_, i) => cols[i] || makeColumnBlock());
                      const equalWidth = Math.floor(100 / count);
                      onUpdate({ children: newCols, attrs: { ...block.attrs, widths: Array(count).fill(equalWidth) } });
                    }}
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded border transition-colors',
                      cols.length === count ? 'bg-primary/10 border-primary/30 text-primary' : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {count} cols
                  </button>
                ))}
              </>
            )}
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: widths.map((w) => `${w}%`).join(' ') }}>
            {cols.map((col, ci) => {
              const innerBlocks = col.children || [];
              return (
                <div key={col.id} className="rounded border border-dashed p-2 min-h-[3rem] bg-background space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-muted-foreground">Column {ci + 1}</p>
                    {isFocused && cols.length > 1 && (
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); updateColumnWidth(ci, Math.max(10, widths[ci] - 5)); }}
                          className="text-[10px] text-muted-foreground hover:text-foreground px-0.5"
                        >
                          −
                        </button>
                        <span className="text-[10px] text-muted-foreground w-6 text-center">{widths[ci]}%</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); updateColumnWidth(ci, Math.min(90, widths[ci] + 5)); }}
                          className="text-[10px] text-muted-foreground hover:text-foreground px-0.5"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  {innerBlocks.map((inner, ii) => (
                    <div key={inner.id} className="group/inner flex items-start gap-1">
                      {inner.type === 'image' && inner.content ? (
                        <img src={inner.content} alt={inner.attrs?.alt || ''} className="max-h-24 rounded object-cover" />
                      ) : inner.type === 'code' ? (
                        <pre className="text-xs bg-muted rounded p-1 flex-1 overflow-x-auto font-mono"><code>{inner.content || '// empty'}</code></pre>
                      ) : inner.type === 'quote' ? (
                        <blockquote className="text-xs italic text-muted-foreground border-l-2 pl-2 flex-1">{inner.content || 'Empty quote'}</blockquote>
                      ) : inner.type === 'divider' ? (
                        <hr className="w-full my-1" />
                      ) : inner.type === 'heading' ? (
                        <Input
                          value={inner.content}
                          onChange={(e) => updateColumnInner(ci, ii, { content: e.target.value })}
                          placeholder={`Heading...`}
                          className="text-sm font-bold border-0 px-0 focus-visible:ring-0 min-h-0 h-7"
                        />
                      ) : (
                        <Input
                          value={inner.content}
                          onChange={(e) => updateColumnInner(ci, ii, { content: e.target.value })}
                          placeholder={`Column ${ci + 1}...`}
                          className="text-sm border-0 px-0 focus-visible:ring-0 min-h-0 h-7"
                        />
                      )}
                      {isFocused && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <div className="relative group/add">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); addColumnInner(ci); }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          {innerBlocks.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeColumnInner(ci, ii); }}
                              className="opacity-0 group-hover/inner:opacity-100 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'table': {
      const rows = block.attrs?.rows || [];
      const colCount = rows[0]?.cells.length || 0;
      if (isFocused) {
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Table</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const newRows = [...rows, { cells: Array(rows[0]?.cells.length || 2).fill('') }];
                  onUpdate({ attrs: { ...block.attrs, rows: newRows } });
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                + Row
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const newRows = rows.map((r) => ({ cells: [...r.cells, ''] }));
                  onUpdate({ attrs: { ...block.attrs, rows: newRows } });
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                + Col
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {rows[0]?.cells.map((_, ci) => (
                      <th key={ci} className="border p-0">
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="text-[10px] text-muted-foreground">Col {ci + 1}</span>
                          {colCount > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newRows = rows.map((r) => ({ cells: r.cells.filter((_, j) => j !== ci) }));
                                onUpdate({ attrs: { ...block.attrs, rows: newRows } });
                              }}
                              className="text-[10px] text-muted-foreground hover:text-destructive"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="border p-0 w-6" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.cells.map((cell, ci) => (
                        <td key={ci} className="border p-0">
                          <Input
                            value={cell}
                            onChange={(e) => {
                              const newRows = [...rows];
                              newRows[ri] = { ...newRows[ri], cells: [...newRows[ri].cells] };
                              newRows[ri].cells[ci] = e.target.value;
                              onUpdate({ attrs: { ...block.attrs, rows: newRows } });
                            }}
                            placeholder={ri === 0 ? `Header ${ci + 1}` : `Cell ${ri},${ci + 1}`}
                            className="border-0 text-xs focus-visible:ring-0"
                          />
                        </td>
                      ))}
                      <td className="border p-0 w-6">
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdate({ attrs: { ...block.attrs, rows: rows.filter((_, i) => i !== ri) } });
                            }}
                            className="w-full h-full text-muted-foreground hover:text-destructive text-xs"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      if (rows.length === 0) return <p className="text-muted-foreground text-sm">Empty table</p>;
      return (
        <div className="overflow-x-auto my-2">
          <table className="w-full border-collapse border rounded-lg">
            <thead>
              <tr>
                {rows[0].cells.map((cell, i) => (
                  <th key={i} className="border bg-muted px-3 py-2 text-left font-medium text-sm">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.cells.map((cell, ci) => (
                    <td key={ci} className="border px-3 py-2 text-sm">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'file':
      return (
        <div className="space-y-2">
          {isFocused ? (
            <>
              <div className="flex items-center gap-2">
                <Input
                  value={block.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder="File URL..."
                  className="font-mono text-sm flex-1"
                />
                <FileUploadButton
                  onUpload={(url) => onUpdate({ content: url })}
                  accept="*"
                  label="Upload"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={block.attrs?.fileName || ''}
                  onChange={(e) => onUpdate({ attrs: { ...block.attrs, fileName: e.target.value } })}
                  placeholder="File name"
                  className="text-sm"
                />
                <Input
                  value={block.attrs?.fileSize || ''}
                  onChange={(e) => onUpdate({ attrs: { ...block.attrs, fileSize: e.target.value } })}
                  placeholder="File size (e.g. 2.4 MB)"
                  className="text-sm"
                />
              </div>
            </>
          ) : block.content ? (
            <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors my-2">
              <span className="text-2xl">📎</span>
              <div className="flex-1 min-w-0">
                <a href={block.content} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate block">
                  {block.attrs?.fileName || 'Download file'}
                </a>
                {block.attrs?.fileSize && <p className="text-xs text-muted-foreground">{block.attrs.fileSize}</p>}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              File block (click to add)
            </div>
          )}
        </div>
      );

    case 'quiz':
      return (
        <div className="my-2 rounded-lg border p-4 space-y-3">
          {isFocused ? (
            <Textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Question..."
              className="min-h-[60px] font-medium border-0 px-0 resize-none focus-visible:ring-0"
              autoFocus
            />
          ) : (
            <p className="font-medium">{block.content || <span className="text-muted-foreground">Quiz question</span>}</p>
          )}
          <div className="space-y-2">
            {(block.attrs?.options || []).map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFocused) onUpdate({ attrs: { ...block.attrs, correctAnswer: i } });
                  }}
                  className={cn(
                    'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0',
                    block.attrs?.correctAnswer === i ? 'border-green-500 bg-green-500' : 'border-muted-foreground/30'
                  )}
                >
                  {block.attrs?.correctAnswer === i && <span className="text-white text-xs">✓</span>}
                </button>
                {isFocused ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const options = [...(block.attrs?.options || [])];
                        options[i] = e.target.value;
                        onUpdate({ attrs: { ...block.attrs, options } });
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="text-sm"
                    />
                    {(block.attrs?.options || []).length > 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const options = (block.attrs?.options || []).filter((_, j) => j !== i);
                          onUpdate({ attrs: { ...block.attrs, options, correctAnswer: (block.attrs?.correctAnswer || 0) > i ? (block.attrs?.correctAnswer || 1) - 1 : block.attrs?.correctAnswer } });
                        }}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-sm">{option}</span>
                )}
              </div>
            ))}
            {isFocused && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const options = [...(block.attrs?.options || []), `Option ${(block.attrs?.options || []).length + 1}`];
                  onUpdate({ attrs: { ...block.attrs, options } });
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add option
              </button>
            )}
          </div>
          {isFocused && (
            <Textarea
              value={block.attrs?.explanation || ''}
              onChange={(e) => onUpdate({ attrs: { ...block.attrs, explanation: e.target.value } })}
              placeholder="Explanation (shown after answer)..."
              className="min-h-[40px] text-sm italic border-0 px-0 resize-none focus-visible:ring-0"
            />
          )}
          {!isFocused && block.attrs?.explanation && (
            <p className="text-sm text-muted-foreground italic border-t pt-2">{block.attrs.explanation}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}

function getYoutubeEmbedUrl(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

export function extractYoutubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      parts.push(
        <a key={key++} href={match[5]} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
          {match[4]}
        </a>
      );
    } else if (match[6]) {
      parts.push(<code key={key++} className="px-1 py-0.5 rounded bg-muted text-sm font-mono">{match[6]}</code>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data?.data?.url || null;
  } catch {
    return null;
  }
}

function FileUploadButton({ onUpload, accept, label }: { onUpload: (url: string) => void; accept?: string; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);
    if (url) onUpload(url);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept || 'image/jpeg,image/png,image/gif,image/webp,application/pdf'}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1 text-xs h-7"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {label || 'Upload'}
      </Button>
    </>
  );
}

function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteMode, setPasteMode] = useState<'markdown' | 'html'>('markdown');
  const [pasteText, setPasteText] = useState('');
  const [edgeTarget, setEdgeTarget] = useState<{ blockId: string; edge: 'left' | 'right' } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const edgeTargetRef = useRef<{ blockId: string; edge: 'left' | 'right' } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocusedBlockId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  const updateBlock = useCallback((index: number, updates: Partial<Block>) => {
    const updated = blocks.map((b, i) => i === index ? { ...b, ...updates, attrs: updates.attrs !== undefined ? (updates.attrs as BlockAttrs) : b.attrs } : b);
    onChange(updated);
  }, [blocks, onChange]);

  const removeBlock = useCallback((index: number) => {
    if (focusedBlockId === blocks[index]?.id) setFocusedBlockId(null);
    onChange(blocks.filter((_, i) => i !== index));
  }, [blocks, onChange, focusedBlockId]);

  const addBlock = useCallback((type: BlockType, afterIndex?: number) => {
    const newBlock = createBlock(type);
    const idx = afterIndex !== undefined ? afterIndex + 1 : blocks.length;
    const updated = [...blocks.slice(0, idx), newBlock, ...blocks.slice(idx)];
    onChange(updated);
    setFocusedBlockId(newBlock.id);
  }, [blocks, onChange]);

  const updateChildBlock = useCallback((blockIndex: number, childIndex: number, updates: Partial<Block>) => {
    const block = blocks[blockIndex];
    if (!block.children) return;
    const updatedChildren = block.children.map((c, i) => i === childIndex ? { ...c, ...updates } : c);
    updateBlock(blockIndex, { children: updatedChildren });
  }, [blocks, updateBlock]);

  const addChildBlock = useCallback((blockIndex: number, afterChildIndex?: number) => {
    const block = blocks[blockIndex];
    const newChild = createBlock('paragraph');
    const children = block.children || [];
    const idx = afterChildIndex !== undefined ? afterChildIndex + 1 : children.length;
    const updatedChildren = [...children.slice(0, idx), newChild, ...children.slice(idx)];
    updateBlock(blockIndex, { children: updatedChildren });
  }, [blocks, updateBlock]);

  const removeChildBlock = useCallback((blockIndex: number, childIndex: number) => {
    const block = blocks[blockIndex];
    if (!block.children) return;
    updateBlock(blockIndex, { children: block.children.filter((_, i) => i !== childIndex) });
  }, [blocks, updateBlock]);

  function detectEdge(blockId: string, pointerX: number): 'left' | 'right' | null {
    if (!activeBlockId || activeBlockId === blockId) return null;
    const el = containerRef.current?.querySelector(`[data-block-id="${blockId}"]`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const edgeZone = Math.min(rect.width * 0.2, 30);
    if (pointerX - rect.left < edgeZone) return 'left';
    if (rect.right - pointerX < edgeZone) return 'right';
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveBlockId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const overId = event.over?.id as string || null;
    if (!overId || !activeBlockId || overId === activeBlockId) {
      setEdgeTarget(null);
      edgeTargetRef.current = null;
      return;
    }
    let pointerX = pointerRef.current.x;
    const activatorEvent = event.activatorEvent as PointerEvent;
    if (activatorEvent && event.delta) {
      pointerX = activatorEvent.clientX + event.delta.x;
    }
    const edge = detectEdge(overId, pointerX);
    if (edge) {
      const target = { blockId: overId, edge };
      setEdgeTarget(target);
      edgeTargetRef.current = target;
    } else {
      setEdgeTarget(null);
      edgeTargetRef.current = null;
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveBlockId(null);
    const edge = edgeTargetRef.current;
    setEdgeTarget(null);
    edgeTargetRef.current = null;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (edge) {
      const draggedBlock = blocks.find((b) => b.id === active.id);
      const targetBlock = blocks.find((b) => b.id === edge.blockId);
      if (!draggedBlock || !targetBlock) return;

      if (targetBlock.type === 'columns') {
        const leftBlock = edge.edge === 'left' ? draggedBlock : targetBlock;
        const rightBlock = edge.edge === 'left' ? targetBlock : draggedBlock;
        const existingCols = targetBlock.children || [];
        const newCol = { ...createBlock('paragraph'), children: [draggedBlock] };
        const leftCol = { ...createBlock('paragraph'), children: edge.edge === 'left' ? existingCols[0]?.children || [] : existingCols[1]?.children || [] };
        const rightCol = { ...createBlock('paragraph'), children: edge.edge === 'left' ? [draggedBlock] : existingCols[1]?.children || [] };
        const updatedCols = edge.edge === 'left'
          ? [newCol, ...existingCols]
          : [...existingCols, newCol];
        const newWidths = Array(updatedCols.length).fill(Math.floor(100 / updatedCols.length));
        const updated = blocks.map((b) => {
          if (b.id === edge.blockId) return { ...b, children: updatedCols, attrs: { ...b.attrs, widths: newWidths } };
          return b;
        }).filter((b) => b.id !== active.id);
        onChange(updated);
      } else {
        const leftBlock = edge.edge === 'left' ? draggedBlock : targetBlock;
        const rightBlock = edge.edge === 'left' ? targetBlock : draggedBlock;
        const columnsBlock = createBlock('columns', '', { widths: [50, 50] });
        columnsBlock.children = [
          { ...createBlock('paragraph'), children: [leftBlock] },
          { ...createBlock('paragraph'), children: [rightBlock] },
        ];
        const newBlocks = blocks.filter((b) => b.id !== active.id && b.id !== edge.blockId);
        const targetIdx = newBlocks.findIndex((b) => b.id === edge.blockId);
        newBlocks.splice(Math.min(targetIdx, newBlocks.length), 0, columnsBlock);
        onChange(newBlocks);
      }
      return;
    }

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(blocks, oldIndex, newIndex));
  }

  function handlePasteConfirm() {
    if (!pasteText.trim()) return;
    const newBlocks = pasteMode === 'markdown'
      ? blocksFromMarkdown(pasteText)
      : blocksFromHtml(pasteText);
    if (newBlocks.length === 0) return;
    onChange([...blocks, ...newBlocks]);
    setPasteText('');
    setShowPasteModal(false);
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return;
      const newBlocks = blocksFromMarkdown(text);
      if (newBlocks.length === 0) return;
      onChange([...blocks, ...newBlocks]);
    } catch {
      setShowPasteModal(true);
    }
  }

  return (
    <div ref={containerRef} className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {blocks.map((block, index) => (
              <SortableBlock
                key={block.id}
                block={block}
                index={index}
                total={blocks.length}
                focusedBlockId={focusedBlockId}
                edgeTarget={activeBlockId && edgeTarget?.blockId === block.id ? edgeTarget.edge : null}
                onUpdate={(updates) => updateBlock(index, updates)}
                onRemove={() => removeBlock(index)}
                onSetFocus={() => setFocusedBlockId(block.id)}
                addChildBlock={(afterChildIndex) => addChildBlock(index, afterChildIndex)}
                removeChildBlock={(childIndex) => removeChildBlock(index, childIndex)}
                updateChildBlock={(childIndex, updates) => updateChildBlock(index, childIndex, updates)}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeBlockId ? (
            <div className="opacity-90 shadow-xl rounded-lg border bg-background px-3 py-2">
              {blocks
                .filter((b) => b.id === activeBlockId)
                .map((b) => (
                  <div key={b.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GripVertical className="h-3 w-3" />
                    <span className="font-mono text-xs">{blockIcons[b.type]}</span>
                    <span>{blockLabels[b.type]}</span>
                    {b.content && <span className="truncate text-xs opacity-50 max-w-[200px]">{b.content}</span>}
                  </div>
                ))}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <BlockTypeSelector onSelect={(type) => addBlock(type)} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          onClick={handlePasteFromClipboard}
        >
          <ClipboardPaste className="h-3 w-3" />
          Paste
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => { setPasteMode('markdown'); setShowPasteModal(true); }}
        >
          <FileCode className="h-3 w-3" />
          .md
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => { setPasteMode('html'); setShowPasteModal(true); }}
        >
          <Code className="h-3 w-3" />
          HTML
        </Button>
        {blocks.length === 0 && (
          <span className="text-xs text-muted-foreground">Start building your article by adding blocks</span>
        )}
      </div>

      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPasteModal(false)}>
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-lg p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-sm">
              {pasteMode === 'markdown' ? 'Paste Markdown' : 'Paste HTML'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {pasteMode === 'markdown'
                ? 'Paste markdown text and it will be converted to blocks automatically.'
                : 'Paste HTML and it will be converted to blocks automatically.'}
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={pasteMode === 'markdown'
                ? '# Heading\n\nParagraph text...\n\n- List item 1\n- List item 2'
                : '<h2>Title</h2>\n<p>Content here</p>\n<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n</ul>'}
              className="w-full h-48 text-xs font-mono bg-muted rounded p-3 outline-none resize-none border"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowPasteModal(false); setPasteText(''); }}
                className="px-3 py-1.5 text-xs rounded border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteConfirm}
                disabled={!pasteText.trim()}
                className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Convert to Blocks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { BlockEditor };
