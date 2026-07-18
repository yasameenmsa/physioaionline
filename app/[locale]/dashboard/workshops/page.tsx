'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WorkshopProgress {
  workshopId: string;
  title: string;
  slug: string;
  image: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

export default function DashboardWorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/workshops?limit=50');
        const json = await res.json();
        if (json.success) {
          const list = json.data.workshops || [];
          const enriched = await Promise.all(
            list.map(async (w: any) => {
              try {
                const pRes = await fetch(`/api/workshops/${w.slug}/progress`);
                const pJson = await pRes.json();
                return {
                  workshopId: w._id,
                  title: w.title,
                  slug: w.slug,
                  image: w.image,
                  totalLessons: pJson.data?.totalLessons || 0,
                  completedLessons: pJson.data?.completedLessons?.length || 0,
                  percentage: pJson.data?.percentage || 0,
                };
              } catch {
                return {
                  workshopId: w._id,
                  title: w.title,
                  slug: w.slug,
                  image: w.image,
                  totalLessons: w.lessonCount || 0,
                  completedLessons: 0,
                  percentage: 0,
                };
              }
            })
          );
          setWorkshops(enriched.filter((w) => w.completedLessons > 0 || w.percentage > 0));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl font-semibold">My Workshops</h2>
        <Link href="/workshops">
          <Button variant="outline" size="sm">
            Browse Workshops <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </Card>
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <Card className="p-8 text-center space-y-4">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <div>
            <p className="font-medium">No workshop progress yet</p>
            <p className="text-sm text-muted-foreground">Start a workshop to track your progress here</p>
          </div>
          <Link href="/workshops">
            <Button>Browse Workshops</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workshops.map((w) => (
            <Link key={w.workshopId} href={`/workshops/${w.slug}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex gap-3">
                  <div className="relative w-20 h-20 rounded overflow-hidden bg-muted shrink-0">
                    {w.image ? (
                      <Image src={w.image} alt={w.title} fill className="object-cover" />
                    ) : (
                      <BookOpen className="h-6 w-6 m-auto mt-7 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {w.title}
                    </h3>
                    <div className="space-y-1">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            w.percentage === 100 ? 'bg-green-500' : 'bg-primary'
                          )}
                          style={{ width: `${w.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {w.completedLessons}/{w.totalLessons} lessons ({w.percentage}%)
                      </p>
                    </div>
                    {w.percentage === 100 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> In progress
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
