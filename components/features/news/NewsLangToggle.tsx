'use client';

interface NewsLangToggleProps {
  lang: 'en' | 'ar';
  onToggle: (lang: 'en' | 'ar') => void;
}

export function NewsLangToggle({ lang, onToggle }: NewsLangToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-0.5 bg-muted w-fit">
      <button
        type="button"
        onClick={() => onToggle('en')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          lang === 'en'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => onToggle('ar')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          lang === 'ar'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        العربية
      </button>
    </div>
  );
}
