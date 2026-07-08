import { connectDB } from '@/lib/db';
import Question from '@/models/Question';
import Category from '@/models/Category';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; difficulty?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1'));
  const limit = 50;
  const skip = (page - 1) * limit;
  const categoryFilter = params.category;
  const difficultyFilter = params.difficulty;
  const searchFilter = params.search;

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (categoryFilter) filter.category = categoryFilter;
  if (difficultyFilter) filter.difficulty = difficultyFilter;
  if (searchFilter) {
    filter.$or = [
      { questionText: { $regex: searchFilter, $options: 'i' } },
      { source: { $regex: searchFilter, $options: 'i' } },
    ];
  }

  const [questions, total, categories] = await Promise.all([
    Question.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Question.countDocuments(filter),
    Category.find({ active: true }).sort({ name: 1 }).lean(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Questions</h2>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <Link
          href="/admin/questions/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </Link>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Question</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Difficulty</th>
                <th className="text-left p-3 font-medium">Source</th>
                <th className="text-left p-3 font-medium">Active</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(questions as any[]).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No questions found
                  </td>
                </tr>
              ) : (
                (questions as any[]).map((q) => (
                  <tr key={q._id.toString()} className="hover:bg-muted/30">
                    <td className="p-3 max-w-xs">
                      <p className="truncate font-medium">{q.questionText}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {(q.category as any)?.name || '—'}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground max-w-[150px] truncate">
                      {q.source}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        q.active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {q.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/questions/${q._id}/edit`}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/questions?page=${p}`}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm ${
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
