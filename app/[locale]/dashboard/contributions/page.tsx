import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Article from '@/models/Article';
import { Button } from '@/components/ui/button';
import { DeleteArticleButton } from '@/components/features/articles/DeleteArticleButton';
import { Plus } from 'lucide-react';

export default async function ContributionsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  await connectDB();

  const articles = await Article.find({ author: session.user.id })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean();

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">My Articles</h2>
          <p className="text-sm text-muted-foreground">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/dashboard/contributions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Write Article
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 border rounded-lg">
          <h3 className="text-lg font-semibold">No articles yet</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Write your first article to contribute to the knowledge base
          </p>
          <Link href="/dashboard/contributions/new">
            <Button>Write Your First Article</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a: any) => (
            <div
              key={a._id.toString()}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[a.status]}`}
                  >
                    {a.status}
                  </span>
                  {a.category && (
                    <span className="text-xs text-muted-foreground">
                      {a.category.name}
                    </span>
                  )}
                </div>
                <Link
                  href={
                    a.status === 'published'
                      ? `/articles/${a.slug}`
                      : `/dashboard/contributions/${a.slug}/edit`
                  }
                  className="text-sm font-medium hover:text-primary truncate block"
                >
                  {a.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  {a.viewCount} views · v{a.version}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {(a.status === 'draft' || a.status === 'review') && (
                  <Link href={`/dashboard/contributions/${a.slug}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                )}
                {(a.status === 'draft' || a.status === 'review') && (
                  <DeleteArticleButton slug={a.slug} redirectTo="/dashboard/contributions" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
