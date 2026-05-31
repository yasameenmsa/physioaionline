import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import Article from '@/models/Article';
import UserModel from '@/models/User';
import { formatDate, formatDateTime } from '@/lib/utils';
import { SafeImage } from '@/components/ui/SafeImage';
import { ArticleActions } from '@/components/features/articles/ArticleActions';
import { DeleteArticleButton } from '@/components/features/articles/DeleteArticleButton';
import { ArrowLeft, BookOpen, Eye, Clock, User, Hash, Pencil } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();
  await connectDB();

  const article = await Article.findOne({ slug })
    .populate('category', 'name slug')
    .populate('author', '_id name')
    .lean();

  if (!article || article.status !== 'published') {
    notFound();
  }

  const a = article as any;

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Base
          </Link>

          <div className="mb-8">
            <div className="aspect-video w-full rounded-lg overflow-hidden mb-6 bg-muted">
              <SafeImage
                src={a.imageUrl || '/placeholder.svg'}
                alt={a.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex items-center gap-2 mb-4">
              {a.category && (
                <Link
                  href={`/articles?category=${a.category._id}`}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20"
                >
                  {a.category.name}
                </Link>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{a.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {a.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {a.author.name}
                </span>
              )}
              {a.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDate(a.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {a.viewCount + 1} views
              </span>
              <ArticleActions articleId={a._id.toString()} slug={a.slug} />
              {session?.user?.id && a.author?._id?.toString() === session.user.id && (
                <Link
                  href={`/dashboard/contributions/${a.slug}/edit`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              )}
              {session?.user?.role === 'admin' && (
                <DeleteArticleButton slug={a.slug} redirectTo="/articles" />
              )}
              {a.tags?.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Hash className="h-4 w-4" />
                  {a.tags.join(', ')}
                </span>
              )}
            </div>
          </div>

          <div className="prose prose-gray max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-primary prose-img:rounded-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {a.body}
            </ReactMarkdown>
          </div>

          {a.references?.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">References</h2>
              <ol className="space-y-2">
                {a.references.map((ref: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {ref}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-8 pt-4 border-t text-xs text-muted-foreground">
            Last updated: {formatDateTime(a.updatedAt)}
          </div>
        </div>
      </article>
    </div>
  );
}
