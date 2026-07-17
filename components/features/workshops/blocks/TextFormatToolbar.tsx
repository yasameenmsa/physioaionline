'use client';

import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextFormatToolbarProps {
  align?: 'left' | 'center' | 'right';
  dir?: 'ltr' | 'rtl';
  onUpdate: (attrs: Record<string, any>) => void;
}

export function TextFormatToolbar({ align = 'left', dir = 'ltr', onUpdate }: TextFormatToolbarProps) {
  const alignButtons = [
    { value: 'left' as const, icon: AlignLeft, label: 'Align left' },
    { value: 'center' as const, icon: AlignCenter, label: 'Align center' },
    { value: 'right' as const, icon: AlignRight, label: 'Align right' },
  ];

  return (
    <div className="flex items-center gap-0.5 border-l pl-1 ml-1" onClick={(e) => e.stopPropagation()}>
      {alignButtons.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={(e) => { e.stopPropagation(); onUpdate({ align: value === 'left' ? undefined : value }); }}
          className={cn(
            'p-1 rounded text-xs transition-colors',
            align === value
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          title={label}
        >
          <Icon className="h-3 w-3" />
        </button>
      ))}
      <div className="w-px h-3 bg-muted-foreground/20 mx-0.5" />
      <button
        onClick={(e) => { e.stopPropagation(); onUpdate({ dir: dir === 'rtl' ? 'ltr' : 'rtl' }); }}
        className={cn(
          'px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors',
          dir === 'rtl'
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
        title="Toggle text direction"
      >
        {dir === 'rtl' ? 'RTL' : 'LTR'}
      </button>
    </div>
  );
}
