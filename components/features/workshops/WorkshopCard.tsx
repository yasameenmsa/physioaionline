'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Layers, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { IWorkshop } from '@/types/workshop';

interface WorkshopCardProps {
  workshop: IWorkshop & {
    lessonCount?: number;
    blockCount?: number;
    sectionCount?: number;
  };
}

export function WorkshopCard({ workshop }: WorkshopCardProps) {
  const w = workshop as any;

  return (
    <Link href={`/workshops/${w.slug}`}>
      <Card dir={w.language === 'ar' ? 'rtl' : 'ltr'} className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer group">
        <div className="relative aspect-video bg-muted">
          {w.image ? (
            <Image
              src={w.image}
              alt={w.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          {w.price > 0 && (
            <span className="absolute top-2 ltr:right-2 rtl:left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
              ${w.price}
            </span>
          )}
          {w.price === 0 && (
            <span className="absolute top-2 ltr:right-2 rtl:left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap w-fit">
              {w.language === 'ar' ? 'مجاني' : 'Free'}
            </span>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {w.title}
          </h3>
          {w.instructor?.name && (
            <p className="text-sm text-muted-foreground">
              {w.language === 'ar' ? 'بواسطة' : 'by'} {w.instructor.name}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {w.sectionCount || 0} {w.language === 'ar' ? 'أقسام' : 'sections'}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {w.lessonCount || 0} {w.language === 'ar' ? 'دروس' : 'lessons'}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {w.blockCount || 0} {w.language === 'ar' ? 'كتل' : 'blocks'}
            </span>
          </div>
          {w.level && (
            <span className="inline-block text-xs bg-muted px-2 py-0.5 rounded capitalize">
              {w.level === 'beginner' && w.language === 'ar' ? 'مبتدئ' : w.level === 'intermediate' && w.language === 'ar' ? 'متوسط' : w.level === 'advanced' && w.language === 'ar' ? 'متقدم' : w.level}
            </span>
          )}
          {w.language && (
            <span className="inline-block text-xs bg-muted px-2 py-0.5 rounded">
              {w.language === 'ar' ? 'العربية' : 'English'}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
