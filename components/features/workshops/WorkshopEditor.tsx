'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
} from '@dnd-kit/sortable';
import {
  Plus, Save, Check, Loader2, ChevronDown, ChevronRight,
  GripVertical, Trash2, CornerDownRight, ClipboardPaste, MoreVertical,
  Merge, X, Code, Menu,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  WorkshopBlock,
  WorkshopBlockType,
  createWorkshopBlock,
  getEmptyBlock,
} from '@/lib/workshop-blocks';
import { SortableBlock } from './blocks/SortableBlock';
import { BlockTypeSelector } from './blocks/BlockTypeSelector';
import { LessonSidebar } from './LessonSidebar';
import { markdownToBlocks } from '@/lib/markdown-to-blocks';
import { htmlToBlocks } from '@/lib/html-to-blocks';

interface WorkshopLesson {
  _id?: string;
  title: string;
  order: number;
  isFree: boolean;
  blocks: WorkshopBlock[];
  children: WorkshopLesson[];
}

interface WorkshopSection {
  _id?: string;
  title: string;
  order: number;
  lessons: WorkshopLesson[];
}

interface WorkshopEditorProps {
  workshopId?: string;
  initialSections?: WorkshopSection[];
  language?: 'ar' | 'en';
  onSave?: (sections: WorkshopSection[]) => Promise<void>;
}

// Helper to find a lesson by its path
function getLesson(lessons: WorkshopLesson[], path: number[]): WorkshopLesson | null {
  let current: WorkshopLesson[] = lessons;
  for (let i = 0; i < path.length; i++) {
    const idx = path[i];
    if (!current[idx]) return null;
    if (i === path.length - 1) return current[idx];
    current = current[idx].children || [];
  }
  return null;
}

// Helper to update a lesson by its path
function updateLessonAtPath(
  lessons: WorkshopLesson[],
  path: number[],
  updater: (lesson: WorkshopLesson) => WorkshopLesson
): WorkshopLesson[] {
  if (path.length === 0) return lessons;
  return lessons.map((l, i) => {
    if (i !== path[0]) return l;
    if (path.length === 1) return updater(l);
    return {
      ...l,
      children: updateLessonAtPath(l.children || [], path.slice(1), updater),
    };
  });
}

// Helper to remove a lesson by its path
function removeLessonAtPath(lessons: WorkshopLesson[], path: number[]): WorkshopLesson[] {
  if (path.length === 1) {
    return lessons.filter((_, i) => i !== path[0]);
  }
  return lessons.map((l, i) => {
    if (i !== path[0]) return l;
    return { ...l, children: removeLessonAtPath(l.children || [], path.slice(1)) };
  });
}

// Helper to add a child lesson
function addChildLesson(lessons: WorkshopLesson[], path: number[], newLesson: WorkshopLesson): WorkshopLesson[] {
  if (path.length === 0) {
    return [...lessons, newLesson];
  }
  return lessons.map((l, i) => {
    if (i !== path[0]) return l;
    if (path.length === 1) {
      return { ...l, children: [...(l.children || []), newLesson] };
    }
    return { ...l, children: addChildLesson(l.children || [], path.slice(1), newLesson) };
  });
}

export function WorkshopEditor({
  workshopId,
  initialSections = [],
  language = 'en',
  onSave,
}: WorkshopEditorProps) {
  const isRtl = language === 'ar';
  const t = useTranslations('admin.editor');
  const [sections, setSections] = useState<WorkshopSection[]>(initialSections);
  const [activeSection, setActiveSection] = useState<number | null>(
    initialSections.length > 0 ? 0 : null
  );
  const [activeLessonPath, setActiveLessonPath] = useState<number[] | null>(
    initialSections[0]?.lessons?.length > 0 ? [0] : null
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [showHtmlPaste, setShowHtmlPaste] = useState(false);
  const [htmlPasteText, setHtmlPasteText] = useState('');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [overBlockId, setOverBlockId] = useState<string | null>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set());
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [edgeTarget, setEdgeTarget] = useState<{ blockId: string; edge: 'left' | 'right' } | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const edgeTargetRef = useRef<{ blockId: string; edge: 'left' | 'right' } | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoveredColumnRef = useRef<{ blockId: string; columnIndex: number } | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSections = useRef<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  const currentSection = activeSection !== null ? sections[activeSection] : null;
  const currentLesson =
    currentSection && activeLessonPath
      ? getLesson(currentSection.lessons, activeLessonPath)
      : null;

  const triggerAutoSave = useCallback(
    (newSections: WorkshopSection[]) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        const serialized = JSON.stringify(newSections);
        if (serialized === lastSavedSections.current) return;
        if (!onSave) return;
        setSaveStatus('saving');
        try {
          await onSave(newSections);
          lastSavedSections.current = serialized;
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {
          setSaveStatus('error');
        }
      }, 3000);
    },
    [onSave]
  );

  function updateSections(newSections: WorkshopSection[]) {
    setSections(newSections);
    triggerAutoSave(newSections);
  }

  // Section operations
  function addSection() {
    const newSection: WorkshopSection = {
      title: '',
      order: sections.length,
      lessons: [],
    };
    const newSections = [...sections, newSection];
    updateSections(newSections);
    setActiveSection(newSections.length - 1);
    setActiveLessonPath(null);
  }

  function updateSectionTitle(index: number, title: string) {
    const newSections = sections.map((s, i) =>
      i === index ? { ...s, title } : s
    );
    updateSections(newSections);
  }

  function removeSection(index: number) {
    const newSections = sections.filter((_, i) => i !== index);
    updateSections(newSections);
    if (activeSection === index) {
      setActiveSection(newSections.length > 0 ? 0 : null);
      setActiveLessonPath(null);
    } else if (activeSection !== null && activeSection > index) {
      setActiveSection(activeSection - 1);
    }
  }

  // Lesson operations
  function addLesson(sectionIndex: number, parentPath: number[] = []) {
    const newLesson: WorkshopLesson = {
      title: t('newLesson'),
      order: 0,
      isFree: false,
      blocks: [getEmptyBlock()],
      children: [],
    };
    const newSections = sections.map((s, i) => {
      if (i !== sectionIndex) return s;
      return {
        ...s,
        lessons: addChildLesson(s.lessons, parentPath, newLesson),
      };
    });
    updateSections(newSections);
    setActiveSection(sectionIndex);
    // Navigate to the new lesson
    const parent = parentPath.length > 0
      ? getLesson(newSections[sectionIndex].lessons, parentPath)
      : null;
    const siblingCount = parent
      ? (parent.children?.length || 0)
      : newSections[sectionIndex].lessons.length;
    setActiveLessonPath([...parentPath, siblingCount - 1]);
  }

  function updateLessonTitle(path: number[], title: string) {
    if (activeSection === null) return;
    const newSections = sections.map((s, i) => {
      if (i !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, path, (l) => ({ ...l, title })),
      };
    });
    updateSections(newSections);
  }

  function removeLesson(sectionIndex: number, path: number[]) {
    const newSections = sections.map((s, i) => {
      if (i !== sectionIndex) return s;
      return {
        ...s,
        lessons: removeLessonAtPath(s.lessons, path),
      };
    });
    updateSections(newSections);
    setActiveLessonPath(null);
  }

  // Block operations
  function updateBlock(blockId: string, content: string, attrs?: any) {
    if (activeSection === null || !activeLessonPath) return;
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => ({
          ...l,
          blocks: l.blocks.map((b) =>
            b.id === blockId
              ? {
                  ...b,
                  content,
                  ...(attrs !== undefined && {
                    attrs: { ...(b.attrs || {}), ...attrs },
                  }),
                }
              : b
          ),
        })),
      };
    });
    updateSections(newSections);
  }

  function deleteBlock(blockId: string) {
    if (activeSection === null || !activeLessonPath) return;
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => ({
          ...l,
          blocks: l.blocks.length <= 1 ? l.blocks : l.blocks.filter((b) => b.id !== blockId),
        })),
      };
    });
    updateSections(newSections);
  }

  function convertBlock(blockId: string, newType: WorkshopBlockType) {
    if (activeSection === null || !activeLessonPath) return;
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => ({
          ...l,
          blocks: l.blocks.map((b) => {
            if (b.id !== blockId) return b;
            const newBlock = createWorkshopBlock(newType, b.content, b.attrs);
            return { ...newBlock, id: b.id };
          }),
        })),
      };
    });
    updateSections(newSections);
  }

  function addBlockAfter(blockId: string, type: string) {
    if (activeSection === null || !activeLessonPath) return;
    const newBlock = createWorkshopBlock(type as WorkshopBlockType);
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => {
          const idx = l.blocks.findIndex((b) => b.id === blockId);
          const newBlocks = [...l.blocks];
          newBlocks.splice(idx + 1, 0, newBlock);
          return { ...l, blocks: newBlocks };
        }),
      };
    });
    updateSections(newSections);
  }

  function toggleBlockSelection(blockId: string) {
    setSelectedBlockIds((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedBlockIds(new Set());
  }

  function mergeBlocks() {
    if (activeSection === null || !activeLessonPath || selectedBlockIds.size < 2) return;
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => {
          const selected = l.blocks.filter((b) => selectedBlockIds.has(b.id));
          if (selected.length < 2) return l;
          const firstType = selected[0].type;
          const mergedContent = selected
            .map((b) => {
              if (b.type === 'divider') return '---';
              if (b.type === 'image') return `![${b.attrs?.alt || ''}](${b.attrs?.src || ''})`;
              if (b.type === 'youtube') return b.content;
              if (b.type === 'code') return '```\n' + b.content + '\n```';
              if (b.type === 'quote') return '> ' + b.content;
              if (b.type === 'list') {
                return b.content.split('\n').map((item, i) =>
                  b.attrs?.listType === 'ordered' ? `${i + 1}. ${item}` : `- ${item}`
                ).join('\n');
              }
              return b.content;
            })
            .filter((c) => c.trim() !== '')
            .join('\n\n');
          const mergedBlock = createWorkshopBlock(firstType as WorkshopBlockType, mergedContent, selected[0].attrs);
          const nonSelected = l.blocks.filter((b) => !selectedBlockIds.has(b.id));
          const firstIdx = l.blocks.findIndex((b) => b.id === selected[0].id);
          const newBlocks = [...nonSelected];
          let insertAt = 0;
          for (let i = 0; i < l.blocks.length; i++) {
            if (l.blocks[i].id === selected[0].id) {
              insertAt = newBlocks.findIndex((b) => b.id === selected[0].id);
              if (insertAt === -1) insertAt = newBlocks.length;
              break;
            }
          }
          newBlocks.splice(insertAt, 0, mergedBlock);
          return { ...l, blocks: newBlocks };
        }),
      };
    });
    updateSections(newSections);
    clearSelection();
  }

  function pasteBlocksAfter(blockId: string, newBlocks: WorkshopBlock[]) {
    if (activeSection === null || !activeLessonPath || newBlocks.length === 0) return;
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => {
          const idx = l.blocks.findIndex((b) => b.id === blockId);
          const newBlocksArr = [...l.blocks];
          newBlocksArr.splice(idx + 1, 0, ...newBlocks);
          return { ...l, blocks: newBlocksArr };
        }),
      };
    });
    updateSections(newSections);
  }

  function replaceBlockWith(blockId: string, replacementBlocks: WorkshopBlock[]) {
    if (activeSection === null || !activeLessonPath || replacementBlocks.length === 0) return;
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => {
          const idx = l.blocks.findIndex((b) => b.id === blockId);
          if (idx === -1) return l;
          const newBlocksArr = [...l.blocks];
          newBlocksArr.splice(idx, 1, ...replacementBlocks);
          return { ...l, blocks: newBlocksArr };
        }),
      };
    });
    updateSections(newSections);
  }

  async function handlePasteFromClipboard(afterBlockId?: string) {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return;
      const newBlocks = markdownToBlocks(text);
      if (newBlocks.length === 0) return;
      if (afterBlockId) {
        replaceBlockWith(afterBlockId, newBlocks);
      } else {
        // Append to end of lesson
        if (activeSection === null || !activeLessonPath) return;
        const newSections = sections.map((s, si) => {
          if (si !== activeSection) return s;
          return {
            ...s,
            lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => ({
              ...l,
              blocks: [...l.blocks, ...newBlocks],
            })),
          };
        });
        updateSections(newSections);
      }
    } catch {
      // Clipboard API may fail if user hasn't granted permission
    }
  }

  function handleHtmlPaste() {
    if (!htmlPasteText.trim()) return;
    const newBlocks = htmlToBlocks(htmlPasteText);
    if (newBlocks.length === 0) {
      alert(t('noValidBlocks'));
      return;
    }
    if (currentLesson) {
      const newSections = sections.map((s, si) => {
        if (si !== activeSection) return s;
        return {
          ...s,
          lessons: updateLessonAtPath(s.lessons, activeLessonPath!, (l) => ({
            ...l,
            blocks: [...l.blocks, ...newBlocks],
          })),
        };
      });
      setSections(newSections);
    }
    setShowHtmlPaste(false);
    setHtmlPasteText('');
  }

  function handleColumnHover(blockId: string, columnIndex: number) {
    hoveredColumnRef.current = { blockId, columnIndex };
  }

  function detectEdge(blockId: string, pointerX: number): 'left' | 'right' | null {
    if (!activeBlockId || activeBlockId === blockId) return null;
    const el = document.querySelector(`[data-block-id="${blockId}"]`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const edgeZone = Math.min(rect.width * 0.2, 30);
    if (pointerX - rect.left < edgeZone) return 'left';
    if (rect.right - pointerX < edgeZone) return 'right';
    return null;
  }

  function createColumnsFromDrag(draggedId: string, targetId: string, edge: 'left' | 'right') {
    if (activeSection === null || !activeLessonPath) return;
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => {
          const draggedBlock = l.blocks.find((b) => b.id === draggedId);
          const targetBlock = l.blocks.find((b) => b.id === targetId);
          if (!draggedBlock || !targetBlock) return l;
          const leftBlock = edge === 'left' ? draggedBlock : targetBlock;
          const rightBlock = edge === 'left' ? targetBlock : draggedBlock;
          const columnsBlock = createWorkshopBlock('columns', '', {
            columns: [[leftBlock], [rightBlock]],
            widths: [6, 6],
          });
          const newBlocks = l.blocks.filter(
            (b) => b.id !== draggedId && b.id !== targetId
          );
          const targetIdx = l.blocks.findIndex((b) => b.id === targetId);
          const insertIdx = Math.min(targetIdx, newBlocks.length);
          newBlocks.splice(insertIdx, 0, columnsBlock);
          return { ...l, blocks: newBlocks };
        }),
      };
    });
    updateSections(newSections);
  }

  function addToColumnFromDrag(draggedId: string, columnBlockId: string, edge: 'left' | 'right') {
    if (activeSection === null || !activeLessonPath) return;
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => {
          const draggedBlock = l.blocks.find((b) => b.id === draggedId);
          if (!draggedBlock) return l;
          return {
            ...l,
            blocks: l.blocks
              .filter((b) => b.id !== draggedId)
              .map((b) => {
                if (b.id !== columnBlockId) return b;
                if (b.type !== 'columns') return b;
                const columns = b.attrs?.columns || [[], []];
                const widths = b.attrs?.widths || columns.map(() => Math.floor(12 / columns.length));
                if (edge === 'left') {
                  return {
                    ...b,
                    attrs: {
                      ...b.attrs,
                      columns: [[draggedBlock], ...columns],
                      widths: [Math.floor(12 / (columns.length + 1)), ...widths],
                    },
                  };
                } else {
                  return {
                    ...b,
                    attrs: {
                      ...b.attrs,
                      columns: [...columns, [draggedBlock]],
                      widths: [...widths, Math.floor(12 / (columns.length + 1))],
                    },
                  };
                }
              }),
          };
        }),
      };
    });
    updateSections(newSections);
  }

  function extractBlockFromColumn(blockId: string, columnBlockId: string) {
    if (activeSection === null || !activeLessonPath) return;
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => {
          let extractedBlock: WorkshopBlock | null = null;
          const newBlocks = l.blocks.map((b) => {
            if (b.id !== columnBlockId) return b;
            if (b.type !== 'columns') return b;
            const columns = b.attrs?.columns || [[], []];
            let found = false;
            const newColumns = columns.map((col: WorkshopBlock[]) => {
              if (found) return col;
              const idx = col.findIndex((inner) => inner.id === blockId);
              if (idx !== -1) {
                extractedBlock = col[idx];
                found = true;
                return col.filter((_, i) => i !== idx);
              }
              return col;
            });
            if (extractedBlock) {
              const nonEmptyColumns = newColumns.filter((col) => col.length > 0);
              if (nonEmptyColumns.length <= 1) {
                return nonEmptyColumns[0]?.[0] || null;
              }
              return { ...b, attrs: { ...b.attrs, columns: nonEmptyColumns } };
            }
            return b;
          }).filter(Boolean) as WorkshopBlock[];
          if (extractedBlock) {
            const colIdx = l.blocks.findIndex((b) => b.id === columnBlockId);
            newBlocks.splice(colIdx, 0, extractedBlock);
          }
          return { ...l, blocks: newBlocks };
        }),
      };
    });
    updateSections(newSections);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveBlockId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const overId = event.over?.id as string || null;
    setOverBlockId(overId);
    let pointerX = pointerRef.current.x;
    const activatorEvent = event.activatorEvent as PointerEvent;
    if (activatorEvent && event.delta) {
      pointerX = activatorEvent.clientX + event.delta.x;
    }
    if (overId && activeBlockId && overId !== activeBlockId) {
      const edge = detectEdge(overId, pointerX);
      if (edge) {
        const target = { blockId: overId, edge };
        setEdgeTarget(target);
        edgeTargetRef.current = target;
      } else {
        setEdgeTarget(null);
        edgeTargetRef.current = null;
      }
    } else {
      setEdgeTarget(null);
      edgeTargetRef.current = null;
    }
  }

  function moveBlockIntoColumn(blockId: string, targetColumnBlockId: string) {
    if (activeSection === null || !activeLessonPath) return;
    const hovered = hoveredColumnRef.current;
    const colIndex = hovered?.blockId === targetColumnBlockId ? hovered.columnIndex : 0;
    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => {
          const blockToMove = l.blocks.find((b) => b.id === blockId);
          if (!blockToMove) return l;
          return {
            ...l,
            blocks: l.blocks
              .filter((b) => b.id !== blockId)
              .map((b) => {
                if (b.id !== targetColumnBlockId) return b;
                if (b.type !== 'columns') return b;
                const columns = b.attrs?.columns || [[], []];
                const newColumns = columns.map((col: WorkshopBlock[], i: number) => {
                  if (i !== colIndex) return col;
                  return [...col, blockToMove];
                });
                return { ...b, attrs: { ...b.attrs, columns: newColumns } };
              }),
          };
        }),
      };
    });
    updateSections(newSections);
    hoveredColumnRef.current = null;
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveBlockId(null);
    setOverBlockId(null);
    const edge = edgeTargetRef.current;
    setEdgeTarget(null);
    edgeTargetRef.current = null;
    if (activeSection === null || !activeLessonPath) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (edge) {
      const targetBlock = currentLesson?.blocks.find((b) => b.id === edge.blockId);
      if (targetBlock?.type === 'columns') {
        addToColumnFromDrag(active.id as string, edge.blockId, edge.edge);
      } else {
        createColumnsFromDrag(active.id as string, edge.blockId, edge.edge);
      }
      return;
    }

    const newSections = sections.map((s, si) => {
      if (si !== activeSection) return s;
      return {
        ...s,
        lessons: updateLessonAtPath(s.lessons, activeLessonPath, (l) => {
          const oldIndex = l.blocks.findIndex((b) => b.id === active.id);
          const newIndex = l.blocks.findIndex((b) => b.id === over.id);
          return { ...l, blocks: arrayMove(l.blocks, oldIndex, newIndex) };
        }),
      };
    });
    updateSections(newSections);
  }

  async function handleSave() {
    if (!onSave) return;
    setSaveStatus('saving');
    try {
      await onSave(sections);
      lastSavedSections.current = JSON.stringify(sections);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar: Sections & Lessons */}
      <LessonSidebar
        sections={sections}
        activeSection={activeSection}
        activeLessonPath={activeLessonPath}
        language={language}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onSectionChange={(index) => {
          setActiveSection(index);
          setFocusedBlockId(null);
          setActiveLessonPath(
            sections[index]?.lessons?.length > 0 ? [0] : null
          );
          setMobileSidebarOpen(false);
        }}
        onLessonChange={(sectionIndex, path) => {
          setActiveSection(sectionIndex);
          setFocusedBlockId(null);
          setActiveLessonPath(path);
          setMobileSidebarOpen(false);
        }}
        onAddSection={addSection}
        onAddLesson={(sectionIndex, parentPath) =>
          addLesson(sectionIndex, parentPath || [])
        }
        onUpdateSectionTitle={updateSectionTitle}
        onUpdateLessonTitle={(path, title) => {
          if (activeSection !== null) {
            updateLessonTitle(path, title);
          }
        }}
        onRemoveSection={removeSection}
        onRemoveLesson={(path) => {
          if (activeSection !== null) {
            removeLesson(activeSection, path);
          }
        }}
        onSectionsUpdate={updateSections}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-12 border-b flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-1 rounded hover:bg-muted"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="text-sm text-muted-foreground">
            {currentSection && currentLesson ? (
              <span className="flex items-center gap-1">
                <span>{currentSection.title || t('untitledSection')}</span>
                {activeLessonPath && activeLessonPath.length > 1 && (
                  <>
                    {activeLessonPath.map((_, i) => (
                      <span key={i} className="text-muted-foreground/50"> / </span>
                    ))}
                  </>
                )}
                <span> / {currentLesson.title || t('untitledLesson')}</span>
              </span>
            ) : (
              <span>{t('selectLessonToEdit')}</span>
            )}
          </div>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> {t('saving')}
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3 w-3" /> {t('saved')}
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-destructive">{t('saveFailed')}</span>
            )}
            <Button size="sm" onClick={handleSave} disabled={saveStatus === 'saving'}>
              <Save className="h-3.5 w-3.5 mr-1" /> {t('save')}
            </Button>
          </div>
        </div>

        {/* Blocks */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="w-full py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
              {selectedBlockIds.size >= 2 && (
                <div className="mb-3 flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg">
                  <span className="text-xs text-primary font-medium">
                    {t('blocksSelected', { count: selectedBlockIds.size })}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={mergeBlocks}
                  >
                    <Merge className="h-3 w-3 mr-1" /> {t('merge')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={clearSelection}
                  >
                    <X className="h-3 w-3 mr-1" /> {t('clear')}
                  </Button>
                </div>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentLesson.blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={`space-y-1 ${isRtl ? 'text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                    {currentLesson.blocks.map((block, i) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        index={i}
                        totalBlocks={currentLesson.blocks.length}
                        isSelected={focusedBlockId === block.id}
                        isMultiSelected={selectedBlockIds.has(block.id)}
                        isDragging={activeBlockId === block.id}
                        isOver={overBlockId === block.id && activeBlockId !== block.id}
                        edgeTarget={edgeTarget?.blockId === block.id ? edgeTarget.edge : null}
                        onSelect={() => setFocusedBlockId(block.id)}
                        onToggleSelect={() => toggleBlockSelection(block.id)}
                        onUpdate={(id, content, attrs) => updateBlock(id, content, attrs)}
                        onDelete={(id) => deleteBlock(id)}
                        onAddAfter={(id, type) => addBlockAfter(id, type)}
                        onConvertBlock={(id, newType) => convertBlock(id, newType)}
                        onExtractFromColumn={(blockId) => {
                          const colBlock = currentLesson.blocks.find(
                            (b) => b.type === 'columns' && b.attrs?.columns?.some((col: any) => col.some((inner: any) => inner.id === blockId))
                          );
                          if (colBlock) extractBlockFromColumn(blockId, colBlock.id);
                        }}
                        onPasteBlocks={(afterId, text) => {
                          const newBlocks = markdownToBlocks(text);
                          pasteBlocksAfter(afterId, newBlocks);
                        }}
                        onReplaceBlock={(blockId, text) => {
                          const newBlocks = markdownToBlocks(text);
                          replaceBlockWith(blockId, newBlocks);
                        }}
                        onColumnHover={(colIdx) => handleColumnHover(block.id, colIdx)}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeBlockId ? (
                    <div className="opacity-90 shadow-xl rounded-lg border bg-background">
                      {currentLesson.blocks
                        .filter((b) => b.id === activeBlockId)
                        .map((block) => (
                          <SortableBlock
                            key={block.id}
                            block={block}
                            index={0}
                            totalBlocks={1}
                            isSelected={false}
                            onSelect={() => {}}
                            onUpdate={() => {}}
                            onDelete={() => {}}
                            onAddAfter={() => {}}
                          />
                        ))}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              {/* Add block + Paste buttons */}
              <div className="relative mt-4 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="ghost"
                  className="flex-1 border-2 border-dashed text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBlockSelector(!showBlockSelector);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> {t('addBlock')}
                </Button>
                <Button
                  variant="ghost"
                  className="border-2 border-dashed text-muted-foreground hover:text-foreground"
                  onClick={() => handlePasteFromClipboard()}
                >
                  <ClipboardPaste className="h-4 w-4 mr-2" /> {t('pasteAsBlocks')}
                </Button>
                <Button
                  variant="ghost"
                  className="border-2 border-dashed text-muted-foreground hover:text-foreground"
                  onClick={() => setShowHtmlPaste(true)}
                >
                  <Code className="h-4 w-4 mr-2" /> {t('pasteHtml')}
                </Button>
                {showBlockSelector && (
                  <BlockTypeSelector
                    onSelect={(type) => {
                      const newBlock = createWorkshopBlock(type as WorkshopBlockType);
                      const newSections = sections.map((s, si) => {
                        if (si !== activeSection) return s;
                        return {
                          ...s,
                          lessons: updateLessonAtPath(s.lessons, activeLessonPath!, (l) => ({
                            ...l,
                            blocks: [...l.blocks, newBlock],
                          })),
                        };
                      });
                      updateSections(newSections);
                      setShowBlockSelector(false);
                    }}
                    onClose={() => setShowBlockSelector(false)}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">{t('noLessonSelected')}</p>
                <p className="text-sm">{t('selectLessonOrCreate')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {showHtmlPaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowHtmlPaste(false)}>
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-lg p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-sm">{t('pasteHtmlTitle')}</h3>
            <p className="text-xs text-muted-foreground">
              {t('pasteHtmlDesc')}
            </p>
            <textarea
              value={htmlPasteText}
              onChange={(e) => setHtmlPasteText(e.target.value)}
              placeholder='<h2>Title</h2><p>Content here</p><ul><li>Item 1</li><li>Item 2</li></ul>'
              className="w-full h-48 text-xs font-mono bg-muted rounded p-3 outline-none resize-none border"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowHtmlPaste(false); setHtmlPasteText(''); }}
                className="px-3 py-1.5 text-xs rounded border hover:bg-muted"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleHtmlPaste}
                className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t('convertToBlocks')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
