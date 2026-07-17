'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  WorkshopBlock,
  WorkshopBlockType,
  createWorkshopBlock,
  workshopBlockLabels,
  workshopBlockIcons,
  workshopBlockCategories,
} from '@/lib/workshop-blocks';
import { renderInnerBlock } from './InnerBlockEditor';

interface BlockComponentProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
}

interface ToggleItem {
  id: string;
  title: string;
  blocks: WorkshopBlock[];
}

function InlineBlockPicker({
  onSelect,
  onClose,
}: {
  onSelect: (type: WorkshopBlockType) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const allTypes = [
    ...workshopBlockCategories.basic,
    ...workshopBlockCategories.media,
    ...workshopBlockCategories.advanced,
  ];
  const filtered = allTypes.filter((t) =>
    workshopBlockLabels[t].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="border rounded-lg bg-background shadow-lg p-1.5 w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter' && filtered[0]) onSelect(filtered[0]);
        }}
        placeholder="Search blocks..."
        className="w-full text-xs bg-muted rounded px-2 py-1 outline-none mb-1"
        autoFocus
      />
      <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-0.5">
        {filtered.map((type) => (
          <button
            key={type}
            className="flex items-center gap-1.5 p-1.5 text-xs rounded hover:bg-muted text-left"
            onClick={() => onSelect(type)}
          >
            <span className="text-sm">{workshopBlockIcons[type]}</span>
            <span>{workshopBlockLabels[type]}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2 col-span-2">
            No blocks found
          </p>
        )}
      </div>
    </div>
  );
}

function ToggleItemEditor({
  item,
  onUpdateItem,
  onDelete,
}: {
  item: ToggleItem;
  onUpdateItem: (updates: Partial<ToggleItem>) => void;
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  function addBlock(type: WorkshopBlockType) {
    onUpdateItem({
      blocks: [...item.blocks, createWorkshopBlock(type)],
    });
    setShowPicker(false);
  }

  function updateBlock(blockId: string, content: string, attrs?: any) {
    onUpdateItem({
      blocks: item.blocks.map((b) =>
        b.id === blockId
          ? { ...b, content, ...(attrs !== undefined && { attrs }) }
          : b
      ),
    });
  }

  function deleteBlock(blockId: string) {
    onUpdateItem({
      blocks: item.blocks.filter((b) => b.id !== blockId),
    });
  }

  function moveBlock(oldIndex: number, newIndex: number) {
    const arr = [...item.blocks];
    const [moved] = arr.splice(oldIndex, 1);
    arr.splice(newIndex, 0, moved);
    onUpdateItem({ blocks: arr });
  }

  return (
    <div className="border rounded-lg overflow-hidden group/item">
      <div className="flex items-center gap-2 bg-muted/30 hover:bg-muted/50 transition-colors">
        <button
          className="p-2 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <input
          type="text"
          value={item.title}
          onChange={(e) => onUpdateItem({ title: e.target.value })}
          placeholder="Toggle title..."
          className="flex-1 bg-transparent border-0 outline-none text-sm font-medium py-2 pr-2"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity mr-1"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      {isOpen && (
        <div className="p-3 pt-2 border-t space-y-2">
          {item.blocks.length === 0 && !showPicker && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No blocks yet
            </p>
          )}
          <div className="space-y-1">
            {item.blocks.map((block, i) => (
              <div key={block.id} className="group/toggleblock flex items-start gap-1">
                <div className="flex flex-col gap-0 mt-1 shrink-0 opacity-0 group-hover/toggleblock:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (i > 0) moveBlock(i, i - 1); }}
                    disabled={i === 0}
                    className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                  >
                    <ChevronUp className="h-2.5 w-2.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (i < item.blocks.length - 1) moveBlock(i, i + 1); }}
                    disabled={i === item.blocks.length - 1}
                    className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                  >
                    <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  {renderInnerBlock(block, updateBlock)}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                  className="mt-1 p-0.5 text-destructive opacity-0 group-hover/toggleblock:opacity-100 shrink-0"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
          {showPicker ? (
            <InlineBlockPicker
              onSelect={addBlock}
              onClose={() => setShowPicker(false)}
            />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPicker(true);
              }}
              className="w-full py-1.5 text-xs text-muted-foreground hover:text-foreground rounded border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="h-3 w-3" /> Add block
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ToggleBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
}: BlockComponentProps) {
  const items: ToggleItem[] = block.attrs?.items || [
    { id: `item-${Date.now()}`, title: '', blocks: [] },
  ];

  function setItems(newItems: ToggleItem[]) {
    onUpdate(block.content, { ...block.attrs, items: newItems });
  }

  function addItem() {
    setItems([
      ...items,
      { id: `item-${Date.now()}`, title: '', blocks: [] },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, updates: Partial<ToggleItem>) {
    setItems(
      items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  }

  return (
    <div
      className={cn(
        'p-2 rounded border space-y-1',
        isSelected && 'bg-muted/30 border-primary/30'
      )}
      onClick={onSelect}
    >
      {items.map((item, i) => (
        <ToggleItemEditor
          key={item.id}
          item={item}
          onUpdateItem={(updates) => updateItem(i, updates)}
          onDelete={() => removeItem(i)}
        />
      ))}
      <button
        onClick={(e) => {
          e.stopPropagation();
          addItem();
        }}
        className="w-full py-1.5 text-xs text-muted-foreground hover:text-foreground rounded border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors flex items-center justify-center gap-1"
      >
        <Plus className="h-3 w-3" /> Add toggle item
      </button>
    </div>
  );
}
