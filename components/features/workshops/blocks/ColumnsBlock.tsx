'use client';

import { useState, useMemo } from 'react';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  WorkshopBlock,
  WorkshopBlockType,
  workshopBlockLabels,
  workshopBlockIcons,
  workshopBlockCategories,
  createWorkshopBlock,
} from '@/lib/workshop-blocks';
import { renderInnerBlock } from './InnerBlockEditor';

interface ColumnsBlockProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  isDropTarget?: boolean;
  onColumnHover?: (columnIndex: number) => void;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
}

function InlineBlockTypePicker({
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

function SortableInnerBlock({
  block,
  onUpdate,
  onDelete,
}: {
  block: WorkshopBlock;
  onUpdate: (blockId: string, content: string, attrs?: any) => void;
  onDelete: (blockId: string) => void;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/colblock flex items-start gap-1',
        isDragging && 'opacity-30 z-50'
      )}
    >
      <button
        className="mt-1 p-1 rounded opacity-0 group-hover/colblock:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shrink-0 border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <div className="flex-1 min-w-0 relative group/block">
        {renderInnerBlock(block, onUpdate)}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(block.id);
          }}
          className="absolute -top-1 -right-1 opacity-0 group-hover/block:opacity-100 p-0.5 bg-destructive text-white rounded-full transition-opacity z-20"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

function ColumnCell({
  columnBlocks,
  columnIndex,
  width,
  isDropTarget,
  onWidthChange,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  canRemove,
  onRemoveColumn,
  onExtractBlock,
}: {
  columnBlocks: WorkshopBlock[];
  columnIndex: number;
  width: number;
  isDropTarget?: boolean;
  onWidthChange: (w: number) => void;
  onAddBlock: (columnIndex: number, type: WorkshopBlockType) => void;
  onUpdateBlock: (
    columnIndex: number,
    blockId: string,
    content: string,
    attrs?: any
  ) => void;
  onDeleteBlock: (columnIndex: number, blockId: string) => void;
  canRemove: boolean;
  onRemoveColumn: () => void;
  onExtractBlock?: (blockId: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [activeInnerId, setActiveInnerId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const blockIds = useMemo(() => columnBlocks.map((b) => b.id), [columnBlocks]);

  function handleInnerDragStart(event: DragStartEvent) {
    setActiveInnerId(event.active.id as string);
  }

  function handleInnerDragEnd(event: DragEndEvent) {
    setActiveInnerId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columnBlocks.findIndex((b) => b.id === active.id);
    const newIndex = columnBlocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(columnBlocks, oldIndex, newIndex);
    onUpdateBlock(columnIndex, reordered[0]?.id || '', '', { __reordered: true, blocks: reordered });
  }

  return (
    <div
      className={cn(
        'relative min-h-[5rem] border border-dashed rounded-lg p-2 space-y-1 bg-background transition-all',
        isDropTarget && 'border-primary bg-primary/5'
      )}
      style={{ flex: `${width} 0 0%` }}
    >
      {isDropTarget && columnBlocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-primary text-primary-foreground text-[10px] font-medium px-2 py-1 rounded-full shadow">
            Drop here
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 py-0.5 rounded">
            {width}/12
          </span>
          <select
            value={width}
            onChange={(e) => onWidthChange(parseInt(e.target.value))}
            className="text-[10px] bg-muted border-0 rounded px-1 py-0.5 outline-none cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                {w}/12
              </option>
            ))}
          </select>
        </div>
        {canRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveColumn();
            }}
            className="p-0.5 text-destructive hover:bg-destructive/10 rounded"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleInnerDragStart}
        onDragEnd={handleInnerDragEnd}
      >
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {columnBlocks.map((b) => (
              <SortableInnerBlock
                key={b.id}
                block={b}
                onUpdate={(blockId, content, attrs) =>
                  onUpdateBlock(columnIndex, blockId, content, attrs)
                }
                onDelete={(blockId) => onDeleteBlock(columnIndex, blockId)}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeInnerId ? (
            <div className="opacity-90 shadow-xl rounded-lg border bg-background">
              {columnBlocks
                .filter((b) => b.id === activeInnerId)
                .map((b) => (
                  <div key={b.id} className="p-1">
                    {renderInnerBlock(b, () => {})}
                  </div>
                ))}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showPicker ? (
        <InlineBlockTypePicker
          onSelect={(type) => {
            onAddBlock(columnIndex, type);
            setShowPicker(false);
          }}
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
  );
}

export function ColumnsBlock({
  block,
  isSelected,
  isDropTarget,
  onColumnHover,
  onSelect,
  onUpdate,
}: ColumnsBlockProps) {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const columns: WorkshopBlock[][] = block.attrs?.columns || [[], []];
  const widths: number[] =
    block.attrs?.widths ||
    columns.map(() => Math.floor(12 / columns.length));
  const columnCount = columns.length;

  function setColumns(newColumns: WorkshopBlock[][], newWidths: number[]) {
    onUpdate(block.content, {
      ...block.attrs,
      columns: newColumns,
      widths: newWidths,
    });
  }

  function addBlockToColumn(columnIndex: number, type: WorkshopBlockType) {
    const newColumns = columns.map((col, i) => {
      if (i !== columnIndex) return col;
      return [...col, createWorkshopBlock(type)];
    });
    setColumns(newColumns, widths);
  }

  function updateBlockInColumn(
    columnIndex: number,
    blockId: string,
    content: string,
    attrs?: any
  ) {
    if (attrs?.__reordered) {
      const newColumns = columns.map((col, i) => {
        if (i !== columnIndex) return col;
        return attrs.blocks;
      });
      setColumns(newColumns, widths);
      return;
    }
    const newColumns = columns.map((col, i) => {
      if (i !== columnIndex) return col;
      return col.map((b) =>
        b.id === blockId
          ? { ...b, content, ...(attrs !== undefined && { attrs }) }
          : b
      );
    });
    setColumns(newColumns, widths);
  }

  function deleteBlockInColumn(columnIndex: number, blockId: string) {
    const newColumns = columns.map((col, i) => {
      if (i !== columnIndex) return col;
      return col.filter((b) => b.id !== blockId);
    });
    setColumns(newColumns, widths);
  }

  function setColumnWidth(columnIndex: number, newWidth: number) {
    const newWidths = widths.map((w, i) =>
      i === columnIndex ? newWidth : w
    );
    const total = newWidths.reduce((s, w) => s + w, 0);
    if (total > 12) {
      const excess = total - 12;
      const othersTotal = newWidths.reduce(
        (s, w, i) => (i !== columnIndex ? s + w : s),
        0
      );
      if (othersTotal > 0) {
        let remaining = excess;
        newWidths.forEach((_, i) => {
          if (i !== columnIndex && remaining > 0) {
            const reduce = Math.min(newWidths[i] - 1, remaining);
            newWidths[i] -= reduce;
            remaining -= reduce;
          }
        });
      }
    }
    const finalTotal = newWidths.reduce((s, w) => s + w, 0);
    if (finalTotal !== 12 && newWidths.length > 0) {
      newWidths[newWidths.length - 1] += 12 - finalTotal;
    }
    setColumns(columns, newWidths);
  }

  function addColumn() {
    if (columnCount >= 6) return;
    const remaining = 12 - widths.reduce((s, w) => s + w, 0);
    const newWidth = Math.max(1, remaining);
    setColumns([...columns, []], [...widths, newWidth]);
  }

  function removeColumn(index: number) {
    if (columnCount <= 1) return;
    const freedBlocks = columns[index];
    const freed = widths[index];
    const newColumns = columns.filter((_, i) => i !== index);
    const newWidths = widths.filter((_, i) => i !== index);
    if (newWidths.length > 0) {
      newWidths[newWidths.length - 1] += freed;
      newColumns[newColumns.length - 1] = [
        ...newColumns[newColumns.length - 1],
        ...freedBlocks,
      ];
    }
    setColumns(newColumns, newWidths);
  }

  return (
    <div
      className={cn(
        'relative p-2 rounded border transition-all',
        isSelected && 'bg-muted/30 border-primary/30',
        isDropTarget && 'ring-2 ring-primary/50 border-primary bg-primary/5'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-1 mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            addColumn();
          }}
          className="text-[10px] px-1.5 py-0.5 rounded border bg-muted hover:bg-muted/80 text-muted-foreground"
        >
          + Column
        </button>
        {columnCount > 2 && (
          <span className="text-[10px] text-muted-foreground">
            {columnCount} columns
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {columns.map((col, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 transition-all',
              isDropTarget && hoveredCol === i && 'ring-2 ring-primary/70 bg-primary/10 rounded-lg'
            )}
            onMouseEnter={() => {
              if (isDropTarget) {
                setHoveredCol(i);
                onColumnHover?.(i);
              }
            }}
            onMouseLeave={() => {
              if (isDropTarget) setHoveredCol(null);
            }}
          >
            <ColumnCell
              columnBlocks={col}
              columnIndex={i}
              width={widths[i] || Math.floor(12 / columnCount)}
              isDropTarget={isDropTarget && hoveredCol === i}
              onWidthChange={(w) => setColumnWidth(i, w)}
              onAddBlock={addBlockToColumn}
              onUpdateBlock={updateBlockInColumn}
              onDeleteBlock={deleteBlockInColumn}
              canRemove={columnCount > 1}
              onRemoveColumn={() => removeColumn(i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
