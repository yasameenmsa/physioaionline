'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageFilterProps {
  onFilter: (language: string | null) => void;
}

export function LanguageFilter({ onFilter }: LanguageFilterProps) {
  const [active, setActive] = useState<string | null>(null);

  function toggle(lang: string | null) {
    const next = active === lang ? null : lang;
    setActive(next);
    onFilter(next);
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <button
        onClick={() => toggle(null)}
        className={cn(
          'px-3 py-1.5 text-xs rounded-full border transition-colors',
          active === null
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
        )}
      >
        All
      </button>
      <button
        onClick={() => toggle('en')}
        className={cn(
          'px-3 py-1.5 text-xs rounded-full border transition-colors',
          active === 'en'
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
        )}
      >
        English
      </button>
      <button
        onClick={() => toggle('ar')}
        className={cn(
          'px-3 py-1.5 text-xs rounded-full border transition-colors',
          active === 'ar'
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
        )}
      >
        العربية
      </button>
    </div>
  );
}
