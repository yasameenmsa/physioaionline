'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter();

  function handleCategoryClick(categoryId: string | null) {
    const params = new URLSearchParams();
    if (categoryId) {
      params.set('category', categoryId);
    }
    router.push(`/articles?${params.toString()}`);
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => handleCategoryClick(null)}
        className={cn(
          'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
          !activeCategory
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
      >
        All Categories
      </button>
      {categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => handleCategoryClick(cat._id)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
            activeCategory === cat._id
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
