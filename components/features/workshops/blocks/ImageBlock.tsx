'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, LinkIcon, Maximize2, Minimize2, Expand, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ImageFit = 'cover' | 'contain' | 'full';

const FIT_OPTIONS: { value: ImageFit; label: string; icon: typeof Maximize2; className: string }[] = [
  { value: 'cover', label: 'Cover', icon: Maximize2, className: 'object-cover' },
  { value: 'contain', label: 'Contain', icon: Expand, className: 'object-contain' },
  { value: 'full', label: 'Full width', icon: Minimize2, className: 'object-cover' },
];

interface BlockComponentProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
}

export function ImageBlock({ block, isSelected, onSelect, onUpdate }: BlockComponentProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const src = block.attrs?.src || '';
  const fit: ImageFit = block.attrs?.fit || 'contain';
  const posX = block.attrs?.posX ?? 50;
  const posY = block.attrs?.posY ?? 50;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success) {
        onUpdate('', { ...block.attrs, src: json.data.url, alt: file.name });
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  function handleUrlSubmit() {
    if (urlInput.trim()) {
      onUpdate('', { ...block.attrs, src: urlInput.trim() });
      setShowUrlInput(false);
      setUrlInput('');
    }
  }

  const isCover = fit === 'cover' || fit === 'full';

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isCover || !src) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, px: posX, py: posY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [isCover, src, posX, posY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    const newX = Math.max(0, Math.min(100, dragStartRef.current.px + dx));
    const newY = Math.max(0, Math.min(100, dragStartRef.current.py + dy));
    onUpdate(block.content, { ...block.attrs, posX: newX, posY: newY });
  }, [isDragging, onUpdate, block]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  if (!src) {
    return (
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors',
          isSelected && 'border-primary'
        )}
        onClick={() => {
          onSelect();
          fileRef.current?.click();
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        {uploading ? (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload an image
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowUrlInput(true);
              }}
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Or paste URL
            </Button>
          </div>
        )}
        {showUrlInput && (
          <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 text-sm border rounded px-2 py-1"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <Button size="sm" onClick={handleUrlSubmit}>OK</Button>
          </div>
        )}
      </div>
    );
  }

  const fitOption = FIT_OPTIONS.find((o) => o.value === fit) || FIT_OPTIONS[1];
  const isFullWidth = fit === 'full';

  return (
    <div className={cn('rounded-lg overflow-hidden', isFullWidth ? '' : 'p-2', isSelected && !isFullWidth && 'bg-muted/30')} onClick={onSelect}>
      <div
        className={cn(
          'relative bg-muted rounded overflow-hidden',
          isFullWidth ? 'w-screen relative left-1/2 -translate-x-1/2 h-[50vh]' : 'aspect-video',
          isCover && 'cursor-grab active:cursor-grabbing select-none'
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <Image
          src={src}
          alt={block.attrs?.alt || 'Workshop image'}
          fill
          sizes={isFullWidth ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
          className={fitOption.className}
          draggable={false}
          style={isCover ? { objectPosition: `${posX}% ${posY}%` } : undefined}
        />
        {isCover && isSelected && !isDragging && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 pointer-events-none">
            <Move className="h-2.5 w-2.5" /> Drag to reposition
          </div>
        )}
      </div>
      <div
        className="flex items-center gap-1 mt-2 px-1"
        onClick={(e) => e.stopPropagation()}
      >
        {FIT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(block.content, { ...block.attrs, fit: opt.value });
              }}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors',
                fit === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              <Icon className="h-2.5 w-2.5" />
              {opt.label}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={block.attrs?.caption || ''}
        onChange={(e) => onUpdate(block.content, { ...block.attrs, caption: e.target.value })}
        placeholder="Add a caption..."
        className="w-full text-xs text-muted-foreground bg-transparent border-0 outline-none mt-2 p-1"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
