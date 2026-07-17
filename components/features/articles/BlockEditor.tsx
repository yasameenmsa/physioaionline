'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, GripVertical, Trash2, ChevronUp, ChevronDown,
  Heading1, Heading2, Heading3, Type, Quote, Code2,
  List, ImageIcon, Video, Minus, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Link2, Palette
} from 'lucide-react';
import type { Block, BlockType, BlockAttrs } from '@/lib/blocks';
import { createBlock, blockLabels } from '@/lib/blocks';

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

function BlockToolbar({
  block,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: Block;
  index: number;
  total: number;
  onUpdate: (attrs: Partial<Block>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [showStyle, setShowStyle] = useState(false);

  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <span className="cursor-grab text-muted-foreground">
        <GripVertical className="h-3.5 w-3.5" />
      </span>
      <button
        type="button"
        onClick={onMoveUp}
        disabled={index === 0}
        className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={index === total - 1}
        className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {block.type === 'paragraph' && (
        <>
          <button
            type="button"
            onClick={() => onUpdate({ attrs: { ...block.attrs, align: block.attrs?.align === 'center' ? 'right' : block.attrs?.align === 'right' ? 'left' : 'center' } })}
            className={`p-0.5 rounded ${block.attrs?.align && block.attrs.align !== 'left' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {block.attrs?.align === 'center' ? <AlignCenter className="h-3.5 w-3.5" /> : block.attrs?.align === 'right' ? <AlignRight className="h-3.5 w-3.5" /> : <AlignLeft className="h-3.5 w-3.5" />}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStyle(!showStyle)}
              className={`p-0.5 rounded ${block.attrs?.style ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Palette className="h-3.5 w-3.5" />
            </button>
            {showStyle && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStyle(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border bg-popover p-1.5 shadow-lg">
                  {(['normal', 'muted', 'highlight', 'info', 'warning'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors ${block.attrs?.style === style ? 'bg-accent' : ''}`}
                      onClick={() => { onUpdate({ attrs: { ...block.attrs, style: style === 'normal' ? undefined : style } }); setShowStyle(false); }}
                    >
                      {style === 'normal' && 'Normal'}
                      {style === 'muted' && <span className="text-muted-foreground">Muted</span>}
                      {style === 'highlight' && <span className="text-primary">Highlight</span>}
                      {style === 'info' && <span className="text-blue-500">Info</span>}
                      {style === 'warning' && <span className="text-amber-500">Warning</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {block.type === 'heading' && (
        <>
          {([1, 2, 3] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onUpdate({ attrs: { ...block.attrs, level } })}
              className={`p-0.5 rounded text-xs font-bold ${block.attrs?.level === level ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              H{level}
            </button>
          ))}
        </>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 rounded text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const addBlock = useCallback((type: BlockType, afterIndex?: number) => {
    const newBlock = createBlock(type);
    const idx = afterIndex !== undefined ? afterIndex + 1 : blocks.length;
    const updated = [...blocks.slice(0, idx), newBlock, ...blocks.slice(idx)];
    onChange(updated);
  }, [blocks, onChange]);

  const updateBlock = useCallback((index: number, updates: Partial<Block>) => {
    const updated = blocks.map((b, i) => i === index ? { ...b, ...updates, attrs: updates.attrs !== undefined ? (updates.attrs as BlockAttrs) : b.attrs } : b);
    onChange(updated);
  }, [blocks, onChange]);

  const removeBlock = useCallback((index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  }, [blocks, onChange]);

  const moveBlock = useCallback((index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const updated = [...blocks];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated);
  }, [blocks, onChange]);

  const renderBlockEditor = (block: Block, index: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-1">
            <Input
              value={block.content}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              placeholder="Enter heading..."
              className={`border-0 px-0 text-${block.attrs?.level || 2}xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0`}
              style={{ fontSize: block.attrs?.level === 1 ? '1.875rem' : block.attrs?.level === 2 ? '1.5rem' : '1.25rem' }}
            />
          </div>
        );

      case 'paragraph':
        return (
          <Textarea
            value={block.content}
            onChange={(e) => updateBlock(index, { content: e.target.value })}
            placeholder="Type your content here..."
            className={`min-h-[80px] border-0 px-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
              block.attrs?.align === 'center' ? 'text-center' : block.attrs?.align === 'right' ? 'text-right' : ''
            } ${
              block.attrs?.style === 'muted' ? 'text-muted-foreground italic' :
              block.attrs?.style === 'highlight' ? 'bg-primary/5 rounded-lg px-4 py-3' :
              block.attrs?.style === 'info' ? 'bg-blue-50 dark:bg-blue-950/30 rounded-lg px-4 py-3 text-blue-700 dark:text-blue-300' :
              block.attrs?.style === 'warning' ? 'bg-amber-50 dark:bg-amber-950/30 rounded-lg px-4 py-3 text-amber-700 dark:text-amber-300' :
              ''
            }`}
          />
        );

      case 'image':
        return (
          <div className="space-y-2">
            <Input
              value={block.content}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              placeholder="Paste image URL..."
              className="font-mono text-sm"
            />
            {block.content && (
              <div className="rounded-lg border overflow-hidden max-w-md">
                <img src={block.content} alt="Article image preview" className="w-full h-auto max-h-64 object-cover" loading="lazy" />
              </div>
            )}
            <Input
              value={block.attrs?.caption || ''}
              onChange={(e) => updateBlock(index, { attrs: { ...block.attrs, caption: e.target.value } })}
              placeholder="Image caption (optional)"
              className="text-sm"
            />
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-2">
            <Input
              value={block.content}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              placeholder="Paste YouTube URL..."
              className="font-mono text-sm"
            />
            {block.content && (
              <div className="aspect-video rounded-lg border overflow-hidden bg-muted">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYoutubeId(block.content)}`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}
          </div>
        );

      case 'quote':
        return (
          <div className="relative pl-6 border-l-4 border-primary/40">
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              placeholder="Enter quote..."
              className="min-h-[60px] border-0 px-0 resize-none italic text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        );

      case 'code':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Input
                value={block.attrs?.language || ''}
                onChange={(e) => updateBlock(index, { attrs: { ...block.attrs, language: e.target.value } })}
                placeholder="language (e.g. javascript, python)..."
                className="w-48 text-xs font-mono"
              />
            </div>
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              placeholder="// Your code here..."
              className="min-h-[120px] font-mono text-sm bg-muted border-muted-foreground/20 focus-visible:ring-0"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
            />
          </div>
        );

      case 'list':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateBlock(index, { attrs: { ...block.attrs, listType: block.attrs?.listType === 'ordered' ? 'unordered' : 'ordered' } })}
                className={`text-xs px-2 py-1 rounded border ${block.attrs?.listType === 'ordered' ? 'bg-primary/10 border-primary/30 text-primary' : 'text-muted-foreground'}`}
              >
                {block.attrs?.listType === 'ordered' ? '1. Ordered' : '- Unordered'}
              </button>
            </div>
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              placeholder="One item per line..."
              className="min-h-[80px] border-0 px-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Each line becomes a list item</p>
          </div>
        );

      case 'divider':
        return (
          <div className="flex items-center gap-2 py-2">
            <div className="flex-1 border-t" />
            <button
              type="button"
              onClick={() => removeBlock(index)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Remove divider
            </button>
            <div className="flex-1 border-t" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={block.id} className="group relative rounded-lg border border-transparent hover:border-border/50 transition-colors px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {renderBlockEditor(block, index)}
            </div>
            <div className="shrink-0 flex items-center">
              <BlockToolbar
                block={block}
                index={index}
                total={blocks.length}
                onUpdate={(updates) => updateBlock(index, updates)}
                onRemove={() => removeBlock(index)}
                onMoveUp={() => moveBlock(index, -1)}
                onMoveDown={() => moveBlock(index, 1)}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 pt-1">
        <BlockTypeSelector onSelect={(type) => addBlock(type)} />
        {blocks.length === 0 && (
          <span className="text-xs text-muted-foreground">Start building your article by adding blocks</span>
        )}
      </div>
    </div>
  );
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

export { BlockEditor };
