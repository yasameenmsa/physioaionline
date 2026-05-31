import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, cn } from '@/lib/utils';
import { SafeImage } from '@/components/ui/SafeImage';
import { BookOpen, Eye, Clock } from 'lucide-react';

interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt: string;
  imageUrl?: string;
  category: { name: string; slug: string } | null;
  author: { name: string } | null;
  publishedAt: string | Date;
  viewCount: number;
  tags: string[];
  className?: string;
}

export function ArticleCard({
  title,
  slug,
  excerpt,
  imageUrl,
  category,
  author,
  publishedAt,
  viewCount,
  tags,
  className,
}: ArticleCardProps) {
  return (
    <Link href={`/articles/${slug}`}>
      <Card className={cn('h-full transition-all hover:shadow-md hover:border-primary/20 overflow-hidden', className)}>
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <SafeImage
            src={imageUrl || '/placeholder.svg'}
            alt=""
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {category && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {category.name}
              </span>
            )}
          </div>
          <CardTitle className="text-lg leading-snug">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            {author && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {author.name}
              </span>
            )}
            {publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {viewCount}
            </span>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
