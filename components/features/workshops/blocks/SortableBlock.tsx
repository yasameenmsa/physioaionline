'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkshopBlock, WorkshopBlockType } from '@/lib/workshop-blocks';
import { workshopBlockLabels, workshopBlockIcons } from '@/lib/workshop-blocks';
import { ParagraphBlock } from './ParagraphBlock';
import { HeadingBlock } from './HeadingBlock';
import { ImageBlock } from './ImageBlock';
import { YouTubeBlock } from './YouTubeBlock';
import { QuoteBlock } from './QuoteBlock';
import { CodeBlock } from './CodeBlock';
import { ListBlock } from './ListBlock';
import { DividerBlock } from './DividerBlock';
import { ColumnsBlock } from './ColumnsBlock';
import { CalloutBlock } from './CalloutBlock';
import { ToggleBlock } from './ToggleBlock';
import { TableBlock } from './TableBlock';
import { FileBlock } from './FileBlock';
import { QuizBlock } from './QuizBlock';

interface SortableBlockProps {
  block: WorkshopBlock;
  index: number;
  totalBlocks: number;
  isSelected: boolean;
  isMultiSelected?: boolean;
  isDragging?: boolean;
  isOver?: boolean;
  edgeTarget?: 'left' | 'right' | null;
  onSelect: () => void;
  onToggleSelect?: () => void;
  onUpdate: (id: string, content: string, attrs?: any) => void;
  onDelete: (id: string) => void;
  onAddAfter: (id: string, type: string) => void;
  onConvertBlock?: (id: string, newType: WorkshopBlockType) => void;
  onExtractFromColumn?: (blockId: string) => void;
  onPasteBlocks?: (afterBlockId: string, text: string) => void;
  onReplaceBlock?: (blockId: string, text: string) => void;
  onColumnHover?: (columnIndex: number) => void;
}

export function SortableBlock({
  block,
  index,
  totalBlocks,
  isSelected,
  isMultiSelected,
  isDragging: isDraggingProp,
  isOver,
  edgeTarget,
  onSelect,
  onToggleSelect,
  onUpdate,
  onDelete,
  onAddAfter,
  onConvertBlock,
  onExtractFromColumn,
  onPasteBlocks,
  onReplaceBlock,
  onColumnHover,
}: SortableBlockProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);
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

  const blockProps = {
    block,
    isSelected,
    onSelect,
    onUpdate: (content: string, attrs?: any) => onUpdate(block.id, content, attrs),
    onDelete: () => onDelete(block.id),
    onAddAfter: (type: string) => onAddAfter(block.id, type),
    onPasteBlocks: onPasteBlocks ? (text: string) => onPasteBlocks(block.id, text) : undefined,
    onReplaceBlock: onReplaceBlock ? (text: string) => onReplaceBlock(block.id, text) : undefined,
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'paragraph': return <ParagraphBlock {...blockProps} />;
      case 'heading': return <HeadingBlock {...blockProps} />;
      case 'image': return <ImageBlock {...blockProps} />;
      case 'youtube': return <YouTubeBlock {...blockProps} />;
      case 'quote': return <QuoteBlock {...blockProps} />;
      case 'code': return <CodeBlock {...blockProps} />;
      case 'list': return <ListBlock {...blockProps} />;
      case 'divider': return <DividerBlock {...blockProps} />;
      case 'columns': return <ColumnsBlock {...blockProps} isDropTarget={!!isOver} onColumnHover={onColumnHover} />;
      case 'callout': return <CalloutBlock {...blockProps} />;
      case 'toggle': return <ToggleBlock {...blockProps} />;
      case 'table': return <TableBlock {...blockProps} />;
      case 'file': return <FileBlock {...blockProps} />;
      case 'quiz': return <QuizBlock {...blockProps} />;
      default: return <ParagraphBlock {...blockProps} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      className={cn(
        'group relative flex items-start gap-1',
        isDragging && 'opacity-30 z-50',
        isSelected && 'ring-2 ring-primary/20 rounded-lg',
        isMultiSelected && 'ring-2 ring-blue-400/50 rounded-lg bg-blue-50/50 dark:bg-blue-950/20'
      )}
    >
      {edgeTarget === 'left' && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-full z-30 pointer-events-none" />
      )}
      <button
        className={cn(
          'mt-1 py-1.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shrink-0 border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted text-muted-foreground hover:text-foreground',
          isSelected && 'opacity-100'
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <div className="flex-1 min-w-0">
        {renderBlock()}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm('Are you sure you want to delete this block?')) {
            onDelete(block.id);
          }
        }}
        className={cn(
          'mt-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0',
          isSelected && 'opacity-100'
        )}
        title="Delete block"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={cn(
            'mt-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-muted',
            isSelected && 'opacity-100'
          )}
        >
          <MoreVertical className="h-3 w-3" />
        </button>
        {showMenu && onConvertBlock && (
          <div className="absolute right-0 top-6 z-50 w-44 bg-popover border rounded-lg shadow-md py-1 max-h-64 overflow-y-auto">
            <div className="px-2 py-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Convert to
            </div>
            {(Object.keys(workshopBlockLabels) as WorkshopBlockType[]).map((type) => (
              <button
                key={type}
                onClick={(e) => {
                  e.stopPropagation();
                  onConvertBlock(block.id, type);
                  setShowMenu(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted transition-colors rtl:text-right text-left',
                  block.type === type && 'bg-muted text-foreground font-medium'
                )}
              >
                <span className="w-5 text-center text-[11px]">{workshopBlockIcons[type]}</span>
                <span>{workshopBlockLabels[type]}</span>
                {block.type === type && (
                  <span className="ml-auto text-[10px] text-muted-foreground">current</span>
                )}
              </button>
            ))}
            <div className="border-t mt-1 pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this block?')) {
                    onDelete(block.id);
                    setShowMenu(false);
                  }
                }}
                className="w-full flex items-center gap-2 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <X className="h-3 w-3" />
                <span>Delete block</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {edgeTarget === 'right' && (
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-full z-30 pointer-events-none" />
      )}
    </div>
  );
}
