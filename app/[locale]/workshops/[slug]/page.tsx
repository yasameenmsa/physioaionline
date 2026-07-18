'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
  ArrowLeft,
  BookOpen,
  Pencil,
  Globe,
  Lock,
  Download,
  ClipboardCopy,
  Menu,
  X,
} from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { workshopToMarkdown, downloadMarkdown } from '@/lib/workshop-to-markdown';
import { workshopToPrompt, copyPromptToClipboard } from '@/lib/workshop-to-prompt';
import { Button } from '@/components/ui/button';

// Count all lessons recursively
function countLessons(lessons: any[]): number {
  return lessons.reduce((sum, l) => {
    return sum + 1 + (l.children ? countLessons(l.children) : 0);
  }, 0);
}

// Find a lesson by path
function getLessonByPath(lessons: any[], path: number[]): any {
  if (path.length === 0) return null;
  let current = lessons;
  for (let i = 0; i < path.length; i++) {
    if (!current[path[i]]) return null;
    if (i === path.length - 1) return current[path[i]];
    current = current[path[i]].children || [];
  }
  return null;
}

function renderBlock(block: any) {
  const linkCls = block.attrs?.link ? 'text-primary underline decoration-primary/30 hover:decoration-primary cursor-pointer' : '';
  const linkProps = block.attrs?.link ? { href: block.attrs.link, target: '_blank', rel: 'noopener noreferrer' } : null;

  switch (block.type) {
    case 'paragraph': {
      const pStyle = { textAlign: block.attrs?.align || 'left' };
      const pDir = block.attrs?.dir || 'ltr';
      return linkProps ? (
        <a {...linkProps} dir={pDir} style={pStyle} className={`text-sm leading-relaxed whitespace-pre-wrap ${linkCls}`}>{block.content}</a>
      ) : (
        <p dir={pDir} style={pStyle} className="text-sm leading-relaxed whitespace-pre-wrap">{block.content}</p>
      );
    }
    case 'heading': {
      const level = block.attrs?.level || 2;
      const cls = level === 1 ? 'text-2xl font-bold' : level === 2 ? 'text-xl font-semibold' : level === 3 ? 'text-lg font-medium' : 'text-base font-medium';
      const hStyle = { textAlign: block.attrs?.align || 'left' };
      const hDir = block.attrs?.dir || 'ltr';
      return linkProps ? (
        <a {...linkProps} dir={hDir} style={hStyle} className={`${cls} ${linkCls}`}>{block.content}</a>
      ) : (
        <div dir={hDir} style={hStyle} className={cls}>{block.content}</div>
      );
    }
    case 'image': {
      const fit = block.attrs?.fit || 'contain';
      const imgPosX = block.attrs?.posX ?? 50;
      const imgPosY = block.attrs?.posY ?? 50;
      const fitClass = fit === 'cover' ? 'object-cover' : fit === 'full' ? 'object-cover' : 'object-contain';
      const isFullWidth = fit === 'full';
      const isCoverFit = fit === 'cover' || fit === 'full';
      return block.attrs?.src ? (
        <div className="space-y-1">
          <div className={`relative bg-muted rounded overflow-hidden ${isFullWidth ? 'w-screen relative left-1/2 -translate-x-1/2 h-[50vh]' : ''}`}>
            <img
              src={block.attrs.src}
              alt={block.attrs?.alt || 'Workshop image'}
              className={`w-full h-auto ${fitClass}`}
              loading="lazy"
              style={isCoverFit ? { objectPosition: `${imgPosX}% ${imgPosY}%` } : undefined}
            />
          </div>
          {block.attrs?.caption && (
            <p className="text-xs text-muted-foreground text-center">{block.attrs.caption}</p>
          )}
        </div>
      ) : null;
    }
    case 'youtube': {
      const match = block.content?.match(/(?:v=|youtu\.be\/|embed\/)([^&?]+)/);
      const videoId = match?.[1];
      return videoId ? (
        <div className="space-y-1">
          <div className="relative aspect-video rounded overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {block.attrs?.caption && (
            <p className="text-xs text-muted-foreground text-center">{block.attrs.caption}</p>
          )}
        </div>
      ) : null;
    }
    case 'quote':
      return (
        <blockquote
          dir={block.attrs?.dir || 'ltr'}
          style={{ textAlign: block.attrs?.align || 'left' }}
          className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-primary pl-4 rtl:pl-0 rtl:pr-4 italic text-muted-foreground"
        >
          {block.content}
        </blockquote>
      );
    case 'code':
      return (
        <pre className="bg-muted rounded-lg p-3 overflow-x-auto">
          <code className={`text-xs font-mono${block.attrs?.language && block.attrs.language !== 'plain' ? ` language-${block.attrs.language}` : ''}`}>{block.content}</code>
        </pre>
      );
    case 'list': {
      const items = block.content.split('\n').filter(Boolean);
      const ListTag = block.attrs?.listType === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag
          dir={block.attrs?.dir || 'ltr'}
          style={{ textAlign: block.attrs?.align || 'left' }}
          className={cn('text-sm pl-5 rtl:pl-0 rtl:pr-5 space-y-1', block.attrs?.listType === 'ordered' ? 'list-decimal' : 'list-disc')}
        >
          {items.map((item: string, i: number) => <li key={i}>{item}</li>)}
        </ListTag>
      );
    }
    case 'divider':
      return <hr className="border-muted-foreground/30" />;
    case 'callout': {
      const calloutStyle = block.attrs?.style || 'info';
      const styleClasses: Record<string, string> = {
        normal: 'bg-muted border border-border',
        muted: 'bg-muted/50 border border-border',
        highlight: 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800',
        info: 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800',
        warning: 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800',
      };
      const styleIcons: Record<string, string> = {
        normal: '📌',
        muted: '💬',
        highlight: '✨',
        info: '💡',
        warning: '⚠️',
      };
      return (
        <div
          dir={block.attrs?.dir || 'ltr'}
          style={{ textAlign: block.attrs?.align || 'left' }}
          className={`${styleClasses[calloutStyle] || styleClasses.info} rounded-lg p-3 text-sm`}
        >
          <span className="mr-1">{styleIcons[calloutStyle] || '💡'}</span>
          {linkProps ? (
            <a {...linkProps} className={linkCls}>{block.content}</a>
          ) : (
            block.content
          )}
        </div>
      );
    }
    case 'columns': {
      const cols: any[][] = block.attrs?.columns || [[], []];
      const colWidths: number[] = block.attrs?.widths || cols.map(() => Math.floor(12 / cols.length));
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          {cols.map((col: any[], ci: number) => (
            <div
              key={ci}
              className="space-y-2"
              style={{ flex: `${colWidths[ci] || Math.floor(12 / cols.length)} 0 0%` }}
            >
              {col.length === 0 ? (
                <div className="h-8 border border-dashed rounded text-center text-xs text-muted-foreground flex items-center justify-center">
                  Empty column
                </div>
              ) : (
                col.map((innerBlock: any) => (
                  <div key={innerBlock.id}>{renderBlock(innerBlock)}</div>
                ))
              )}
            </div>
          ))}
        </div>
      );
    }
    case 'toggle': {
      const items = block.attrs?.items || [];
      return (
        <div className="space-y-1">
          {items.map((item: any, i: number) => (
            <ToggleItem key={item.id || i} item={item} />
          ))}
        </div>
      );
    }
    case 'table': {
      const rows = block.attrs?.rows || [];
      const tableDir = block.attrs?.dir || 'ltr';
      const tableAlign = block.attrs?.align || 'left';
      return (
        <table dir={tableDir} style={{ textAlign: tableAlign }} className="w-full text-sm border-collapse">
          <tbody>
            {rows.map((row: string[], ri: number) => (
              <tr key={ri}>
                {row.map((cell: string, ci: number) => (
                  <td key={ci} className={cn('border px-2 py-1', ri === 0 && 'font-medium bg-muted/50')}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    case 'file':
      return block.attrs?.src ? (
        <a href={block.attrs.src} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
          📎 {block.attrs.fileName || 'Download file'}{block.attrs?.fileSize ? ` (${formatFileSize(block.attrs.fileSize)})` : ''}
        </a>
      ) : null;
    case 'quiz':
      return <QuizBlock block={block} />;
    default:
      return <p className="text-sm">{block.content}</p>;
  }
}

function ToggleItem({ item }: { item: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="flex items-center gap-2 w-full p-2 rtl:text-right text-left text-sm font-medium hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        {item.title || 'Untitled'}
      </button>
      {open && (
        <div className="p-3 pt-0 border-t space-y-2">
          {item.blocks && item.blocks.length > 0 ? (
            item.blocks.map((block: any) => (
              <div key={block.id}>{renderBlock(block)}</div>
            ))
          ) : item.content ? (
            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Empty toggle</p>
          )}
        </div>
      )}
    </div>
  );
}

function QuizBlock({ block }: { block: any }) {
  const [selected, setSelected] = useState<number | null>(null);
  const correct = block.attrs?.correctAnswer;
  const options = block.attrs?.options || [];
  const answered = selected !== null;
  const isCorrect = answered && correct !== undefined && selected === correct;

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
      <p className="text-sm font-medium">❓ {block.attrs?.question || block.content}</p>
      {options.map((opt: string, i: number) => {
        let ringClass = '';
        if (answered) {
          if (i === correct) ringClass = 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/30';
          else if (i === selected) ringClass = 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/30';
        } else if (i === selected) {
          ringClass = 'ring-2 ring-primary bg-primary/5';
        }
        return (
          <button
            key={i}
            onClick={() => !answered && setSelected(i)}
            disabled={answered}
            className={`flex items-center gap-2 w-full text-sm p-2 rounded transition-colors text-left rtl:text-right ${ringClass} ${!answered ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'}`}
          >
            {answered ? (
              i === correct ? <CheckCircle className="h-4 w-4 text-green-600 shrink-0" /> :
              i === selected ? <Circle className="h-4 w-4 text-red-500 shrink-0" /> :
              <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
            ) : (
              <Circle className="h-3 w-3 shrink-0" />
            )}
            {opt}
          </button>
        );
      })}
      {answered && block.attrs?.explanation && (
        <p className="text-xs text-muted-foreground mt-2 p-2 bg-background rounded">
          💡 {block.attrs.explanation}
        </p>
      )}
    </div>
  );
}

export default function WorkshopViewPage() {
  const params = useParams();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const [workshop, setWorkshop] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [activeLessonPath, setActiveLessonPath] = useState<number[]>([0]);
  const [toggling, setToggling] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [publishing, setPublishing] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [wRes, pRes] = await Promise.all([
          fetch(`/api/workshops/${slug}`),
          fetch(`/api/workshops/${slug}/progress`).catch(() => null),
        ]);
        const wJson = await wRes.json();
        if (wJson.success) setWorkshop(wJson.data);
        if (pRes) {
          const pJson = await pRes.json();
          if (pJson.success) setProgress(pJson.data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  async function togglePublish() {
    if (publishing) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/workshops/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !workshop.published }),
      });
      const json = await res.json();
      if (json.success) {
        setWorkshop((prev: any) => ({ ...prev, published: !prev.published }));
      }
    } finally {
      setPublishing(false);
    }
  }

  async function toggleLesson(lessonId: string) {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/workshops/${slug}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });
      const json = await res.json();
      if (json.success) {
        setProgress((p: any) => ({
          ...p,
          completedLessons: json.data.completedLessons,
        }));
      }
    } finally {
      setToggling(false);
    }
  }

  function toggleSectionExpand(index: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  // Recursive sidebar lesson renderer
  function renderSidebarLessons(lessons: any[], sectionIndex: number, parentPath: number[] = [], depth: number = 0) {
    return lessons.map((lesson: any, li: number) => {
      const path = [...parentPath, li];
      const isActive = activeSection === sectionIndex && JSON.stringify(activeLessonPath) === JSON.stringify(path);
      const hasChildren = lesson.children && lesson.children.length > 0;
      const isExpanded = expandedSections.has(sectionIndex) || isActive;

      return (
        <div key={path.join('-')}>
          <button
            className={cn(
              'flex items-center gap-1.5 w-full p-1.5 rtl:text-right text-left rounded transition-colors',
              isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
            )}
            style={{ paddingInlineStart: `${8 + depth * 12}px` }}
            onClick={() => {
              setActiveSection(sectionIndex);
              setActiveLessonPath(path);
              setSidebarOpen(false);
            }}
          >
            {hasChildren ? (
              <span onClick={(e) => { e.stopPropagation(); toggleSectionExpand(sectionIndex); }}>
                {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
              </span>
            ) : (
              <span className="w-3 shrink-0" />
            )}
            <span className="truncate text-xs">{lesson.title || `Lesson ${li + 1}`}</span>
          </button>
          {hasChildren && isExpanded && renderSidebarLessons(lesson.children, sectionIndex, path, depth + 1)}
        </div>
      );
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <BookOpen className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Workshop not found</p>
      </div>
    );
  }

  const currentLesson = activeLessonPath
    ? getLessonByPath(workshop.sections?.[activeSection]?.lessons || [], activeLessonPath)
    : null;

  const totalLessons = workshop.sections?.reduce(
    (sum: number, s: any) => sum + countLessons(s.lessons || []), 0
  ) || 0;
  const completedCount = progress?.completedLessons?.length || 0;

  return (
    <div className="flex h-full overflow-hidden relative" dir={workshop.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        className="fixed top-20 left-2 z-50 lg:hidden p-2 rounded-md bg-background border shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      {(() => {
        const isRtl = workshop.language === 'ar';
        const sidebarHidden = isRtl
          ? 'max-lg:right-0 max-lg:translate-x-full'
          : 'max-lg:left-0 max-lg:-translate-x-full';
        return (
          <div className={cn(
            "w-80 border-r rtl:border-r-0 rtl:border-l bg-muted/20 flex flex-col shrink-0",
            "max-lg:fixed max-lg:top-16 max-lg:bottom-0 max-lg:z-50 max-lg:shadow-xl max-lg:transition-transform max-lg:duration-200",
            sidebarOpen ? "max-lg:translate-x-0" : sidebarHidden
          )}>
        <div className="p-4 border-b space-y-2">
          <Link href="/workshops" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> All Workshops
          </Link>
          <h2 className="font-semibold text-sm line-clamp-2">{workshop.title}</h2>
          {session?.user?.role === 'admin' && (
            <>
              <Link href={`/workshops/${slug}/edit`}>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  <Pencil className="h-3 w-3 mr-1" /> Edit Workshop
                </Button>
              </Link>
              <Button
                size="sm"
                variant={workshop.published ? 'outline' : 'default'}
                className="w-full text-xs"
                onClick={togglePublish}
                disabled={publishing}
              >
                {workshop.published ? <Lock className="h-3 w-3 mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
                {workshop.published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  const md = workshopToMarkdown(workshop);
                  downloadMarkdown(md, `${workshop.slug || workshop.title}.md`);
                }}
              >
                <Download className="h-3 w-3 mr-1" /> Export .md
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={async () => {
                  const prompt = workshopToPrompt(workshop);
                  await copyPromptToClipboard(prompt);
                  setCopiedPrompt(true);
                  setTimeout(() => setCopiedPrompt(false), 2000);
                }}
              >
                <ClipboardCopy className="h-3 w-3 mr-1" /> {copiedPrompt ? 'Copied!' : 'Copy AI Prompt'}
              </Button>
            </>
          )}
          {totalLessons > 0 && (
            <div className="space-y-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(completedCount / totalLessons) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {completedCount}/{totalLessons} lessons completed
              </p>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {workshop.sections?.map((section: any, si: number) => (
            <div key={si}>
              <button
                className="flex items-center gap-2 w-full p-2 rtl:text-right text-left text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setActiveSection(si);
                  setActiveLessonPath(section.lessons?.length > 0 ? [0] : []);
                  toggleSectionExpand(si);
                  setSidebarOpen(false);
                }}
              >
                {expandedSections.has(si) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {section.title || `Section ${si + 1}`}
              </button>
              {expandedSections.has(si) && (
                <div className="ml-2 rtl:ml-0 rtl:mr-2">
                  {renderSidebarLessons(section.lessons || [], si)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
        );
      })()}

      {/* Content */}
      <div className="flex-1 overflow-y-auto" dir={workshop.language === 'ar' ? 'rtl' : 'ltr'}>
        {currentLesson ? (
          <div className={`w-full py-6 px-4 sm:py-8 sm:px-6 lg:px-8 space-y-6 ${workshop.language === 'ar' ? 'text-right' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h1 className="text-xl font-semibold">{currentLesson.title}</h1>
              <Button
                size="sm"
                variant={progress?.completedLessons?.includes(currentLesson._id?.toString()) ? 'default' : 'outline'}
                onClick={() => toggleLesson(currentLesson._id?.toString())}
                disabled={toggling}
              >
                {progress?.completedLessons?.includes(currentLesson._id?.toString())
                  ? '✓ Completed'
                  : 'Mark Complete'}
              </Button>
            </div>
            <div className="space-y-4">
              {currentLesson.blocks?.map((block: any) => (
                <div key={block.id}>{renderBlock(block)}</div>
              ))}
              {(!currentLesson.blocks || currentLesson.blocks.length === 0) && (
                <p className="text-muted-foreground text-sm">This lesson has no content yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a lesson to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
