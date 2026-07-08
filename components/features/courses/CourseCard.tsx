'use client';

import Link from 'next/link';
import { Clock, BookOpen, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { formatDuration } from '@/lib/youtube';

interface CourseCardProps {
  course: {
    _id: string;
    slug: string;
    title: string;
    description: string;
    image: string;
    price: number;
    level: string;
    instructor?: { _id: string; name: string };
    lessonCount: number;
    totalDuration: number;
    sectionCount: number;
    createdAt: string;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const t = useTranslations('courses.card');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-video bg-muted relative overflow-hidden">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <BookOpen className="h-12 w-12" />
          </div>
        )}
        {course.price > 0 ? (
          <span className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded`}>
            ${course.price}
          </span>
        ) : (
          <span className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} bg-green-500 text-white text-xs font-medium px-2 py-1 rounded`}>
            {t('free')}
          </span>
        )}
        <span className={`absolute top-2 ${isRtl ? 'right-2' : 'left-2'} bg-background/80 text-xs font-medium px-2 py-1 rounded capitalize`}>
          {course.level}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        {course.instructor && (
          <p className="text-xs text-muted-foreground">
            {t('by')} {course.instructor.name}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lessonCount} {t('lessons')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(course.totalDuration)}
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" />
            {course.sectionCount} {t('sections')}
          </span>
        </div>
      </div>
    </Link>
  );
}
