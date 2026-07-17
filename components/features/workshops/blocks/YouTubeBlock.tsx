'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockComponentProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|\/v\/)([^&?]+)/);
  return match?.[1] || '';
}

export function YouTubeBlock({ block, isSelected, onSelect, onUpdate }: BlockComponentProps) {
  const [url, setUrl] = useState(block.content || '');
  const videoId = extractYouTubeId(url);

  return (
    <div className={cn('p-2 rounded', isSelected && 'bg-muted/30')} onClick={onSelect}>
      {videoId ? (
        <div className="relative aspect-video rounded overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <Play className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              onUpdate(e.target.value);
            }}
            placeholder="Paste YouTube URL here..."
            className="flex-1 bg-transparent border-0 outline-none text-sm"
          />
        </div>
      )}
      {videoId && (
        <input
          type="text"
          value={block.attrs?.caption || ''}
          onChange={(e) => onUpdate(block.content, { ...block.attrs, caption: e.target.value })}
          placeholder="Add a caption..."
          className="w-full text-xs text-muted-foreground bg-transparent border-0 outline-none mt-2 p-1"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
