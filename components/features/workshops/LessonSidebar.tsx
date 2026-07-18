'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, ChevronRight, GripVertical, Trash2, CornerDownRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlatLesson {
  id: string;
  title: string;
  path: number[];
  depth: number;
}

function flattenLessons(lessons: any[], sectionIndex: number, parentPath: number[] = [], depth: number = 0): FlatLesson[] {
  const result: FlatLesson[] = [];
  lessons.forEach((lesson, i) => {
    const path = [...parentPath, i];
    result.push({ id: `s${sectionIndex}-${path.join('.')}`, title: lesson.title, path, depth });
    if (lesson.children?.length > 0) {
      result.push(...flattenLessons(lesson.children, sectionIndex, path, depth + 1));
    }
  });
  return result;
}

function getLessonAtPath(lessons: any[], path: number[]): any {
  let current = lessons;
  for (let i = 0; i < path.length; i++) {
    if (!current[path[i]]) return null;
    if (i === path.length - 1) return current[path[i]];
    current = current[path[i]].children || [];
  }
  return null;
}

function removeLessonAtPath(lessons: any[], path: number[]): { tree: any[]; removed: any } {
  const tree = JSON.parse(JSON.stringify(lessons));
  let removed: any = null;

  function remove(arr: any[], p: number[]): any[] {
    if (p.length === 1) {
      removed = arr[p[0]];
      return arr.filter((_: any, i: number) => i !== p[0]);
    }
    return arr.map((item: any, i: number) => {
      if (i !== p[0]) return item;
      return { ...item, children: remove(item.children || [], p.slice(1)) };
    });
  }

  return { tree: remove(tree, path), removed };
}

function insertLessonAtPath(lessons: any[], path: number[], lesson: any): any[] {
  if (!lesson) return lessons;
  if (path.length === 0) return [...lessons, lesson];
  return lessons.map((item: any, i: number) => {
    if (i !== path[0]) return item;
    if (path.length === 1) {
      const children = [...(item.children || [])];
      children.splice(path[0], 0, lesson);
      return { ...item, children };
    }
    return { ...item, children: insertLessonAtPath(item.children || [], path.slice(1), lesson) };
  });
}

function SortableLessonItem({
  item,
  isActive,
  onTitleChange,
  onAddChild,
  onRemove,
  onSelect,
  language = 'en',
}: {
  item: FlatLesson;
  isActive: boolean;
  onTitleChange: (path: number[], title: string) => void;
  onAddChild: (path: number[]) => void;
  onRemove: (path: number[]) => void;
  onSelect: (path: number[]) => void;
  language?: 'ar' | 'en';
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-1 p-1.5 rounded cursor-pointer text-xs group',
        isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted',
        isDragging && 'opacity-40 z-50'
      )}
      onClick={() => onSelect(item.path)}
    >
      <button
        className="p-0.5 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>
      <span className="w-3 shrink-0" />
      <input
        type="text"
        value={item.title}
        onChange={(e) => {
          e.stopPropagation();
          onTitleChange(item.path, e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        placeholder={language === 'ar' ? 'الدرس' : 'Lesson'}
        className="flex-1 bg-transparent border-0 outline-none text-xs p-0 min-w-0"
      />
      <button
        onClick={(e) => { e.stopPropagation(); onAddChild(item.path); }}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-foreground shrink-0"
        title={language === 'ar' ? 'إضافة درس فرعي' : 'Add sub-lesson'}
      >
        <CornerDownRight className="h-2.5 w-2.5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.path); }}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive shrink-0"
      >
        <Trash2 className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

export function LessonSidebar({
  sections,
  activeSection,
  activeLessonPath,
  onSectionChange,
  onLessonChange,
  onSectionsUpdate,
  onAddSection,
  onAddLesson,
  onUpdateSectionTitle,
  onUpdateLessonTitle,
  onRemoveSection,
  onRemoveLesson,
  language = 'en',
  mobileOpen = false,
  onMobileClose,
}: {
  sections: any[];
  activeSection: number | null;
  activeLessonPath: number[] | null;
  onSectionChange: (index: number) => void;
  onLessonChange: (sectionIndex: number, path: number[]) => void;
  onSectionsUpdate: (sections: any[]) => void;
  onAddSection: () => void;
  onAddLesson: (sectionIndex: number, parentPath?: number[]) => void;
  onUpdateSectionTitle: (index: number, title: string) => void;
  onUpdateLessonTitle: (path: number[], title: string) => void;
  onRemoveSection: (index: number) => void;
  onRemoveLesson: (path: number[]) => void;
  language?: 'ar' | 'en';
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const isAr = language === 'ar';
  const t = {
    title: isAr ? 'محتوى الورشة' : 'Workshop Content',
    noSections: isAr ? 'لا أقسام بعد. اضغط + لإضافة قسم.' : 'No sections yet. Click + to add one.',
    untitled: isAr ? 'بدون عنوان' : 'Untitled',
    addLesson: isAr ? 'إضافة درس' : 'Add lesson',
    lessons: isAr ? 'دروس' : 'lessons',
    section: isAr ? 'قسم' : 'Section',
  };
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(activeSection !== null ? [activeSection] : [])
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const flatLessons = useMemo(() => {
    if (activeSection === null) return [];
    return flattenLessons(sections[activeSection]?.lessons || [], activeSection);
  }, [sections, activeSection]);

  const flatIds = useMemo(() => flatLessons.map((l) => l.id), [flatLessons]);

  function toggleSectionExpand(index: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || activeSection === null) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeIdx = flatLessons.findIndex((l) => l.id === activeId);
    const overIdx = flatLessons.findIndex((l) => l.id === overId);
    if (activeIdx === -1 || overIdx === -1 || activeIdx === overIdx) return;

    const activeItem = flatLessons[activeIdx];
    const overItem = flatLessons[overIdx];

    const sectionLessons = JSON.parse(JSON.stringify(sections[activeSection].lessons));

    if (activeItem.depth === overItem.depth) {
      const parentPath = activeItem.path.slice(0, -1);
      const parent = parentPath.length > 0
        ? getLessonAtPath(sectionLessons, parentPath)
        : null;
      const siblings = parent ? (parent.children || []) : sectionLessons;
      const oldIndex = activeItem.path[activeItem.path.length - 1];
      const newIndex = overItem.path[activeItem.path.length - 1];

      if (oldIndex === newIndex) return;

      const reordered = arrayMove(siblings, oldIndex, newIndex);
      const finalLessons = applyReorder(sectionLessons, parentPath, reordered);

      const newSections = sections.map((s, i) => {
        if (i !== activeSection) return s;
        return { ...s, lessons: finalLessons };
      });
      onSectionsUpdate(newSections);
    } else {
      const { tree: lessonsAfterRemove, removed } = removeLessonAtPath(sectionLessons, activeItem.path);
      if (!removed) return;

      const adjustedOverPath = [...overItem.path];
      const srcLast = activeItem.path[activeItem.path.length - 1];
      const tgtParent = overItem.path.slice(0, -1);
      const tgtLast = overItem.path[overItem.path.length - 1];

      if (JSON.stringify(tgtParent) === JSON.stringify(activeItem.path.slice(0, -1))) {
        if (srcLast < tgtLast) {
          adjustedOverPath[adjustedOverPath.length - 1] = Math.max(0, tgtLast - 1);
        }
      }

      const newLessons = insertLessonAtPath(lessonsAfterRemove, adjustedOverPath, removed);

      const newSections = sections.map((s, i) => {
        if (i !== activeSection) return s;
        return { ...s, lessons: newLessons };
      });
      onSectionsUpdate(newSections);
    }
  }

  function applyReorder(tree: any[], parentPath: number[], reordered: any[]): any[] {
    if (parentPath.length === 0) return reordered;
    return tree.map((item, i) => {
      if (i !== parentPath[0]) return item;
      if (parentPath.length === 1) return { ...item, children: reordered };
      return { ...item, children: applyReorder(item.children || [], parentPath.slice(1), reordered) };
    });
  }

  const draggingItem = draggingId ? flatLessons.find((l) => l.id === draggingId) : null;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      <div className={cn(
        "w-72 border-r bg-muted/30 flex flex-col shrink-0",
        "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:shadow-xl max-lg:bg-background max-lg:transition-transform max-lg:duration-200",
        mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
      )}>
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">{t.title}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddSection}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={onMobileClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sections.length === 0 && (
          <p className="text-xs text-muted-foreground text-center p-4">
            {t.noSections}
          </p>
        )}
        {sections.map((section, si) => (
          <div key={si}>
            <div
              className={cn(
                'flex items-center gap-1 p-2 rounded cursor-pointer text-sm group',
                activeSection === si ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
              onClick={() => {
                onSectionChange(si);
                setExpandedSections((prev) => new Set([...prev, si]));
              }}
            >
              <GripVertical className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100" />
              <button
                onClick={(e) => { e.stopPropagation(); toggleSectionExpand(si); }}
                className="shrink-0"
              >
                <ChevronRight
                  className={cn('h-3 w-3 transition-transform', expandedSections.has(si) && 'rotate-90')}
                />
              </button>
              <input
                type="text"
                value={section.title}
                onChange={(e) => onUpdateSectionTitle(si, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={`${t.section} ${si + 1}`}
                className="flex-1 bg-transparent border-0 outline-none text-sm p-0"
              />
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveSection(si); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            {expandedSections.has(si) && activeSection === si && (
              <div className="ml-2 space-y-0.5">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={flatIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0.5">
                      {flatLessons.map((item) => (
                        <div
                          key={item.id}
                          style={{ paddingLeft: `${item.depth * 16}px` }}
                        >
                          <SortableLessonItem
                            item={item}
                            isActive={
                              activeSection === si &&
                              JSON.stringify(activeLessonPath) === JSON.stringify(item.path)
                            }
                            onTitleChange={onUpdateLessonTitle}
                            onAddChild={(path) => onAddLesson(si, path)}
                            onRemove={(path) => onRemoveLesson(path)}
                            onSelect={(path) => { onSectionChange(si); onLessonChange(si, path); onMobileClose?.(); }}
                            language={language}
                          />
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {draggingItem ? (
                      <div className="flex items-center gap-1 p-1.5 rounded text-xs bg-background shadow-lg border">
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{draggingItem.title || t.untitled}</span>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
                <button
                  onClick={() => onAddLesson(si)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground p-1.5 w-full"
                >
                  <Plus className="h-3 w-3" /> {t.addLesson}
                </button>
              </div>
            )}
            {expandedSections.has(si) && activeSection !== si && (
              <div className="ml-2 p-1.5 text-xs text-muted-foreground">
                {section.lessons?.length || 0} {t.lessons}
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </>
  );
}
