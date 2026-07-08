'use client';

import { useState } from 'react';
import { ChevronDown, CheckCircle2, Circle, Lock, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { ProgressBar } from './ProgressBar';
import { formatDuration } from '@/lib/youtube';

interface Lesson {
  _id: string;
  title: string;
  videoId: string;
  duration: number;
  order: number;
  isFree: boolean;
}

interface Section {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseSyllabusProps {
  sections: Section[];
  currentVideoId: string;
  completedLessons: string[];
  hasAccess: boolean;
  onSelectLesson: (videoId: string) => void;
  onToggleComplete: (videoId: string, completed: boolean) => void;
}

export function CourseSyllabus({
  sections,
  currentVideoId,
  completedLessons,
  hasAccess,
  onSelectLesson,
  onToggleComplete,
}: CourseSyllabusProps) {
  const t = useTranslations('courses.view');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    () => new Set([0])
  );

  const allLessons = sections.flatMap((s) => s.lessons);
  const completedCount = allLessons.filter((l) =>
    completedLessons.includes(l.videoId)
  ).length;
  const totalLessons = allLessons.length;
  const percentage =
    totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

  function toggleSection(index: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function isLessonLocked(lesson: Lesson): boolean {
    if (!hasAccess && !lesson.isFree) return true;
    return false;
  }

  return (
    <div className={`bg-card h-full overflow-y-auto ${isRtl ? 'border-r' : 'border-l'}`}>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm mb-2">{t('courseContent')}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>
            {completedCount}/{totalLessons} {t('completed')}
          </span>
          <span>{percentage}%</span>
        </div>
        <ProgressBar percentage={percentage} size="sm" />
      </div>

      <div className="divide-y">
        {sections.map((section, si) => {
          const sectionCompleted = section.lessons.filter((l) =>
            completedLessons.includes(l.videoId)
          ).length;
          return (
            <div key={section._id || si}>
              <button
                onClick={() => toggleSection(si)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    expandedSections.has(si) ? '' : '-rotate-90'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {section.title || `Section ${si + 1}`}
                  </p>
                    <p className="text-xs text-muted-foreground">
                    {section.lessons.length} {t('lessons')} ·{' '}
                    {sectionCompleted}/{section.lessons.length}
                  </p>
                </div>
              </button>

              {expandedSections.has(si) && (
                <div className="pb-2">
                  {section.lessons.map((lesson) => {
                    const isActive =
                      lesson.videoId === currentVideoId;
                    const isCompleted = completedLessons.includes(
                      lesson.videoId
                    );
                    const locked = isLessonLocked(lesson);

                    return (
                      <div
                        key={lesson._id || lesson.videoId}
                        className={`flex items-center gap-2 px-4 py-2 text-sm ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        <button
                          onClick={() =>
                            onToggleComplete(
                              lesson.videoId,
                              !isCompleted
                            )
                          }
                          disabled={locked}
                          className="shrink-0"
                          title={
                            isCompleted
                              ? t('markIncomplete')
                              : t('markComplete')
                          }
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (!locked) onSelectLesson(lesson.videoId);
                          }}
                          disabled={locked}
                          className="flex-1 flex items-center gap-2 min-w-0 text-left"
                        >
                          {locked ? (
                            <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          ) : (
                            <Play className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span className="truncate">
                            {lesson.title}
                          </span>
                        </button>

                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDuration(lesson.duration)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
