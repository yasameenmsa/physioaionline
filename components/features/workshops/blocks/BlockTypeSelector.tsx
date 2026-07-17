'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { workshopBlockLabels, workshopBlockIcons, workshopBlockCategories } from '@/lib/workshop-blocks';

interface BlockTypeSelectorProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

export function BlockTypeSelector({ onSelect, onClose }: BlockTypeSelectorProps) {
  const t = useTranslations('admin.editor');
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allTypes = [...workshopBlockCategories.basic, ...workshopBlockCategories.media, ...workshopBlockCategories.advanced];
  const filtered = allTypes.filter((type) =>
    workshopBlockLabels[type].toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelect(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  return (
    <div className="absolute z-50 w-72 bg-popover border rounded-lg shadow-lg p-2" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('searchBlocks')}
        className="w-full text-sm bg-transparent border-0 outline-none p-2"
      />
      <div ref={listRef} className="max-h-64 overflow-y-auto mt-1">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center p-4">{t('noBlocksFound')}</p>
        )}
        {filtered.map((type, i) => (
          <button
            key={type}
            className={cn(
              'flex items-center gap-3 w-full p-2 text-left text-sm rounded',
              i === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
            )}
            onClick={() => onSelect(type)}
            onMouseEnter={() => setSelectedIndex(i)}
          >
            <span className="text-lg w-6 text-center">{workshopBlockIcons[type]}</span>
            <span>{workshopBlockLabels[type]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
