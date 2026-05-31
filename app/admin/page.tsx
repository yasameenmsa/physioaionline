import { connectDB } from '@/lib/db';
import Question from '@/models/Question';
import Category from '@/models/Category';
import User from '@/models/User';
import Link from 'next/link';
import { HelpCircle, BookOpen, Users, Layers } from 'lucide-react';

export default async function AdminDashboard() {
  await connectDB();

  const [totalQuestions, totalCategories, totalUsers, recentQuestions] = await Promise.all([
    Question.countDocuments(),
    Category.countDocuments({ active: true }),
    User.countDocuments(),
    Question.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const stats = [
    { label: 'Questions', value: totalQuestions, icon: HelpCircle, href: '/admin/questions' },
    { label: 'Categories', value: totalCategories, icon: Layers, href: '/admin/categories' },
    { label: 'Users', value: totalUsers, icon: Users, href: '#' },
    { label: 'Review Queue', value: '—', icon: BookOpen, href: '/admin/review' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Manage questions, categories, and site content
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
        <h3 className="text-sm font-semibold mb-3">Recent Questions</h3>
        <div className="rounded-lg border">
          {recentQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              No questions yet. <Link href="/admin/questions/new" className="text-primary hover:underline">Add one</Link>
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
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
