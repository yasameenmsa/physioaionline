'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TextFormatToolbar } from './TextFormatToolbar';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface BlockComponentProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
}

export function ListBlock({ block, isSelected, onSelect, onUpdate }: BlockComponentProps) {
  const listType = block.attrs?.listType || 'unordered';
  const items = block.content ? block.content.split('\n') : [''];

  function updateItem(index: number, value: string) {
    const newItems = [...items];
    newItems[index] = value;
    onUpdate(newItems.join('\n'));
  }

  function addItem() {
    onUpdate([...items, ''].join('\n'));
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    const newItems = items.filter((_: string, i: number) => i !== index);
    onUpdate(newItems.join('\n'));
  }

  function moveItem(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    onUpdate(newItems.join('\n'));
  }

  return (
    <div className={cn('p-2 rounded', isSelected && 'bg-muted/30')} onClick={onSelect}>
      <div className={cn('flex gap-1 mb-2 flex-wrap', !isSelected && 'opacity-0 group-hover:opacity-100 transition-opacity')}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(block.content, { ...block.attrs, listType: 'unordered' });
          }}
          className={cn('text-xs px-2 py-0.5 rounded', listType === 'unordered' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}
        >
          • Bullet
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(block.content, { ...block.attrs, listType: 'ordered' });
          }}
          className={cn('text-xs px-2 py-0.5 rounded', listType === 'ordered' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}
        >
          1. Numbered
        </button>
        {isSelected && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); addItem(); }}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80"
            >
              <Plus className="h-3 w-3" /> Item
            </button>
            <TextFormatToolbar
              align={block.attrs?.align}
              dir={block.attrs?.dir}
              onUpdate={(attrs) => onUpdate(block.content, { ...block.attrs, ...attrs })}
            />
          </>
        )}
      </div>
      <div
        dir={block.attrs?.dir || 'ltr'}
        style={{ textAlign: block.attrs?.align || 'left' }}
        className="space-y-1"
      >
        {items.map((item: string, index: number) => (
          <div key={index} className="flex items-start gap-1 group/item">
            {isSelected && (
              <div className="flex flex-col gap-0.5 pt-0.5 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); moveItem(index, index - 1); }}
                  disabled={index === 0}
                  className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveItem(index, index + 1); }}
                  disabled={index === items.length - 1}
                  className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
            )}
            <span className="text-sm text-muted-foreground select-none shrink-0 pt-0.5 w-5 text-right">
              {listType === 'ordered' ? `${index + 1}.` : '•'}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Item ${index + 1}...`}
              className="flex-1 bg-transparent border-0 outline-none text-sm p-0 min-w-0"
              onClick={(e) => e.stopPropagation()}
            />
            {isSelected && items.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
