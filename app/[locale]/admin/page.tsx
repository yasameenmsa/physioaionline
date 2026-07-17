import { connectDB } from '@/lib/db';
import Question from '@/models/Question';
import Category from '@/models/Category';
import User from '@/models/User';
import News from '@/models/News';
import Course from '@/models/Course';
import Workshop from '@/models/Workshop';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { HelpCircle, BookOpen, Users, Layers, Rss, GraduationCap, Calendar, Eye, DollarSign, PenTool } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboard({ params }: PageProps) {
  const { locale } = await params;
  await connectDB();
  const t = await getTranslations({ locale, namespace: 'admin.dashboard' });

  const [totalQuestions, totalCategories, totalUsers, totalNews, totalCourses, totalWorkshops, recentQuestions, recentNewsItems, recentCourses, recentWorkshops] = await Promise.all([
    Question.countDocuments(),
    Category.countDocuments({ active: true }),
    User.countDocuments(),
    News.countDocuments(),
    Course.countDocuments(),
    Workshop.countDocuments(),
    Question.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    News.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Course.find()
      .populate('instructor', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Workshop.find()
      .populate('instructor', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const stats = [
    { label: t('stats.questions'), value: totalQuestions, icon: HelpCircle, href: '/admin/questions' },
    { label: t('stats.categories'), value: totalCategories, icon: Layers, href: '/admin/categories' },
    { label: t('stats.news'), value: totalNews, icon: Rss, href: '/admin/news' },
    { label: t('stats.courses'), value: totalCourses, icon: GraduationCap, href: '/admin/courses' },
    { label: t('stats.workshops'), value: totalWorkshops, icon: PenTool, href: '/admin/workshops' },
    { label: t('stats.users'), value: totalUsers, icon: Users, href: '#' },
    { label: t('stats.reviewQueue'), value: '—', icon: BookOpen, href: '/admin/review' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t('title')}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {t('description')}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border bg-card p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">{t('recentQuestions')}</h3>
        <div className="rounded-lg border">
          {recentQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              {t('noQuestions')} <Link href="/admin/questions/new" className="text-primary hover:underline">{t('addOne')}</Link>
            </p>
          ) : (
            <div className="divide-y">
              {(recentQuestions as any[]).map((q) => (
                <div key={q._id.toString()} className="flex items-center justify-between p-4 text-sm">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="truncate font-medium">{q.questionText}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(q.category as any)?.name} · {q.difficulty}
                    </p>
                  </div>
                  <Link
                    href={`/admin/questions/${q._id}/edit`}
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    {t('edit')}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div>
          <h3 className="text-sm font-semibold mb-3">{t('recentNews')}</h3>
          <div className="rounded-lg border">
            {recentNewsItems.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6 text-center">
                {t('noQuestions')} <Link href="/admin/news/new" className="text-primary hover:underline">{t('addOne')}</Link>
              </p>
            ) : (
              <div className="divide-y">
                {(recentNewsItems as any[]).map((item) => (
                  <div key={item._id.toString()} className="flex items-center justify-between p-4 text-sm">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{item.title}</p>
                          {!item.published && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-1.5 py-0.5 rounded shrink-0">{t('draft')}</span>
                          )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {item.author && <span>{(item.author as any).name}</span>}
                        {item.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.viewCount || 0}
                        </span>
                      </div>
                    </div>
                    <Link href={`/news/${item.slug}`} className="text-xs text-primary hover:underline shrink-0">
                      {t('edit')}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">{t('recentCourses')}</h3>
          <div className="rounded-lg border">
            {recentCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6 text-center">
                {t('noQuestions')} <Link href="/courses/create" className="text-primary hover:underline">{t('addOne')}</Link>
              </p>
            ) : (
              <div className="divide-y">
                {(recentCourses as any[]).map((item) => {
                  const c = item as any;
                  return (
                    <div key={c._id.toString()} className="flex items-center justify-between p-4 text-sm">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{c.title}</p>
                          {!c.published && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-1.5 py-0.5 rounded shrink-0">{t('draft')}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          {c.instructor && <span>{(c.instructor as any).name}</span>}
                          {c.category && <span>{c.category}</span>}
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {c.price > 0 ? `$${c.price}` : t('free')}
                          </span>
                        </div>
                      </div>
                      <Link href={`/courses/${c.slug}`} className="text-xs text-primary hover:underline shrink-0">
                        {t('edit')}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{t('recentWorkshops')}</h3>
          <Link
            href="/workshops/create"
            className="text-xs text-primary hover:underline"
          >
            {t('addOne')} →
          </Link>
        </div>
        <div className="rounded-lg border">
          {recentWorkshops.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              {t('noWorkshops')} <Link href="/workshops/create" className="text-primary hover:underline">{t('addOne')}</Link>
            </p>
          ) : (
            <div className="divide-y">
              {(recentWorkshops as any[]).map((w) => (
                <div key={w._id.toString()} className="flex items-center justify-between p-4 text-sm">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{w.title}</p>
                      {!w.published && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-1.5 py-0.5 rounded shrink-0">{t('draft')}</span>
                      )}
                      {w.language && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded shrink-0">
                          {w.language === 'ar' ? t('langAr') : t('langEn')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {w.instructor && <span>{(w.instructor as any).name}</span>}
                      {w.category && <span>{w.category}</span>}
                      <span>{w.sections?.length || 0} {t('sections')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/workshops/${w.slug}`} className="text-xs text-primary hover:underline">
                      {t('edit')}
                    </Link>
                    <Link
                      href={`/admin/workshops/${w.slug}/edit`}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {t('edit')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
