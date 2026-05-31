import { connectDB } from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';
import { ArticleCard } from '@/components/features/articles/ArticleCard';
import { SearchInput } from './SearchInput';
import { CategoryFilter } from './CategoryFilter';

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { category, search, page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr ?? '1'));
  const limit = 20;
  const skip = (currentPage - 1) * limit;

  await connectDB();

  const categories = await Category.find({ active: true })
    .sort({ name: 1 })
    .lean();

  const filter: Record<string, unknown> = { status: 'published' };
  if (category) {
    filter.category = category;
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Article.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="mt-2 text-muted-foreground">
            Browse evidence-based physiotherapy articles and resources
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <SearchInput initialValue={search ?? ''} />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
                <CategoryFilter
                  categories={categories.map((c) => ({
                    _id: c._id.toString(),
                    name: c.name,
                    slug: c.slug,
                  }))}
                  activeCategory={category ?? null}
                />
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {articles.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-lg font-semibold">No articles found</h3>
                <p className="text-muted-foreground mt-2">
                  {search
                    ? 'Try a different search term'
                    : 'No articles published yet in this category'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article._id.toString()}
                      title={article.title}
                      slug={article.slug}
                      excerpt={(article as any).excerpt}
                      imageUrl={(article as any).imageUrl}
                      category={(article as any).category as { name: string; slug: string } | null}
                      author={(article as any).author as { name: string } | null}
                      publishedAt={article.publishedAt ?? article.createdAt}
                      viewCount={article.viewCount}
                      tags={article.tags}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {currentPage > 1 && (
                      <a
                        href={`/articles?${new URLSearchParams({ ...(category && { category }), ...(search && { search }), page: String(currentPage - 1) }).toString()}`}
                        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-accent"
                      >
                        Previous
                      </a>
                    )}
                    <span className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    {currentPage < totalPages && (
                      <a
                        href={`/articles?${new URLSearchParams({ ...(category && { category }), ...(search && { search }), page: String(currentPage + 1) }).toString()}`}
                        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-accent"
                      >
                        Next
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
