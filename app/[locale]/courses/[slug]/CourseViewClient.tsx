'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  FileText,
  Clock,
  User,
  Lock,
  DollarSign,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseSyllabus } from '@/components/features/courses/CourseSyllabus';
import { CertificateButton } from '@/components/features/courses/CertificateButton';
import { ProgressBar } from '@/components/features/courses/ProgressBar';
import { formatDuration } from '@/lib/youtube';

interface Lesson {
  _id: string;
  title: string;
  videoId: string;
  videoUrl: string;
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

interface CourseData {
  _id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
  level: string;
  tags: string[];
  whatYouLearn: string[];
  requirements: string[];
  published: boolean;
  instructor: { _id: string; name: string } | null;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

interface ProgressData {
  completedLessons: string[];
  percentage: number;
  isComplete: boolean;
  lastVideoId: string;
}

type Tab = 'overview' | 'qa' | 'notes';

interface CourseViewClientProps {
  course: CourseData;
  hasAccess: boolean;
  initialProgress: ProgressData | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUserId?: string;
}

export function CourseViewClient({
  course,
  hasAccess: initialAccess,
  initialProgress,
  isAuthenticated,
  isAdmin,
  currentUserId,
}: CourseViewClientProps) {
  const [hasAccess, setHasAccess] = useState(initialAccess);
  const [progress, setProgress] = useState<ProgressData>(
    initialProgress || {
      completedLessons: [],
      percentage: 0,
      isComplete: false,
      lastVideoId: '',
    }
  );
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [purchasing, setPurchasing] = useState(false);

  const firstLesson =
    course.sections[0]?.lessons[0];

  useEffect(() => {
    if (progress.lastVideoId) {
      setCurrentVideoId(progress.lastVideoId);
    } else if (firstLesson) {
      setCurrentVideoId(firstLesson.videoId);
    }
  }, [progress.lastVideoId, firstLesson]);

  const currentLesson = course.sections
    .flatMap((s) => s.lessons)
    .find((l) => l.videoId === currentVideoId);

  function handleSelectLesson(videoId: string) {
    setCurrentVideoId(videoId);
  }

  const handleToggleComplete = useCallback(
    async (videoId: string, completed: boolean) => {
      setProgress((prev) => {
        const set = new Set(prev.completedLessons);
        if (completed) set.add(videoId);
        else set.delete(videoId);
        const arr = Array.from(set) as string[];
        const allLessons = course.sections.flatMap((s) => s.lessons);
        const pct =
          allLessons.length > 0
            ? Math.round((arr.length / allLessons.length) * 100)
            : 0;
        return {
          ...prev,
          completedLessons: arr,
          percentage: pct,
          isComplete: pct >= 100,
        };
      });

      try {
        await fetch(`/api/courses/${course.slug}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId, completed }),
        });
      } catch {
        setProgress((prev) => {
          const set = new Set(prev.completedLessons);
          if (!completed) set.add(videoId);
          else set.delete(videoId);
          const arr = Array.from(set) as string[];
          const allLessons = course.sections.flatMap(
            (s) => s.lessons
          );
          const pct =
            allLessons.length > 0
              ? Math.round((arr.length / allLessons.length) * 100)
              : 0;
          return {
            ...prev,
            completedLessons: arr,
            percentage: pct,
            isComplete: pct >= 100,
          };
        });
      }
    },
    [course.sections, course.slug]
  );

  async function handlePurchase() {
    setPurchasing(true);
    try {
      const res = await fetch(
        `/api/courses/${course.slug}/purchase`,
        { method: 'POST' }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setHasAccess(true);
    } catch (err: any) {
      alert(err.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  }

  function isLessonLocked(lesson: Lesson): boolean {
    if (!isAuthenticated) return true;
    if (!hasAccess && !lesson.isFree) return true;
    return false;
  }

  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0
  );
  const totalDuration = course.sections.reduce(
    (sum, s) =>
      sum + s.lessons.reduce((ls, l) => ls + l.duration, 0),
    0
  );

  return (
    <div className="min-h-screen bg-background" dir="ltr">
      {/* Top bar */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href="/courses"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-medium truncate">
              {course.title}
            </h1>
          </div>
          {progress.isComplete && (
            <CertificateButton
              courseSlug={course.slug}
              isComplete={progress.isComplete}
            />
          )}
        </div>
        <ProgressBar percentage={progress.percentage} size="sm" />
      </header>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left: Video + Tabs */}
        <div className="flex-1 min-w-0">
          {/* Video player */}
          <div className="relative w-full bg-black">
            <div className="aspect-video w-full max-w-5xl mx-auto">
              {currentLesson && !isLessonLocked(currentLesson) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-white">
                  <Lock className="h-16 w-16 text-muted-foreground" />
                  <p className="text-lg font-medium">
                    {!isAuthenticated
                      ? 'Sign in to access this course'
                      : 'Purchase this course to unlock all lessons'}
                  </p>
                  {!isAuthenticated ? (
                    <Button asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  ) : !hasAccess && course.price > 0 ? (
                    <Button
                      onClick={handlePurchase}
                      disabled={purchasing}
                    >
                      {purchasing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <DollarSign className="h-4 w-4 mr-2" />
                      )}
                      Purchase for ${course.price}
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex px-4">
              {[
                { id: 'overview' as Tab, label: 'Overview', icon: BookOpen },
                { id: 'qa' as Tab, label: 'Q&A', icon: MessageCircle },
                { id: 'notes' as Tab, label: 'Notes', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-4 lg:p-6 max-w-4xl">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {currentLesson?.title || course.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {course.instructor && (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {course.instructor.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {totalLessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(totalDuration)}
                    </span>
                    <span className="capitalize">{course.level}</span>
                  </div>
                </div>

                {course.description && (
                  <div>
                    <h3 className="font-medium mb-1">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {course.description}
                    </p>
                  </div>
                )}

                {course.whatYouLearn.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">
                      What you&apos;ll learn
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.whatYouLearn.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {course.requirements.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Requirements</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {course.requirements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3" />
                <p className="font-medium">Q&A Coming Soon</p>
                <p className="text-sm">
                  Ask questions about this course and get answers from
                  instructors.
                </p>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3" />
                <p className="font-medium">Notes Coming Soon</p>
                <p className="text-sm">
                  Take notes while watching and they&apos;ll be saved
                  here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar: Syllabus */}
        <div className="w-full lg:w-96 shrink-0">
          <CourseSyllabus
            sections={course.sections}
            currentVideoId={currentVideoId}
            completedLessons={progress.completedLessons}
            hasAccess={hasAccess}
            onSelectLesson={handleSelectLesson}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      </div>
    </div>
  );
}
