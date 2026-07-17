'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link2, ExternalLink, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkshopBlock } from '@/lib/workshop-blocks';

function LinkField({
  block,
  onUpdate,
}: {
  block: WorkshopBlock;
  onUpdate: (blockId: string, content: string, attrs?: any) => void;
}) {
  const [show, setShow] = useState(false);
  const [url, setUrl] = useState(block.attrs?.link || '');

  useEffect(() => {
    setUrl(block.attrs?.link || '');
  }, [block.attrs?.link]);

  function save() {
    onUpdate(block.id, block.content, { ...block.attrs, link: url || undefined });
    setShow(false);
  }

  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShow(!show);
        }}
        className={cn(
          'p-0.5 rounded text-[10px] transition-colors',
          block.attrs?.link
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover/block:opacity-100'
        )}
        title="Add link"
      >
        <Link2 className="h-2.5 w-2.5" />
      </button>
      {block.attrs?.link && (
        <a
          href={block.attrs.link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover/block:opacity-100"
          title="Open link"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      )}
      {show && (
        <span
          className="inline-flex items-center gap-0.5 ml-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Link2 className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') setShow(false);
            }}
            onBlur={save}
            placeholder="https://..."
            className="w-32 text-[10px] bg-muted rounded px-1.5 py-0.5 outline-none"
            autoFocus
          />
        </span>
      )}
    </span>
  );
}

function InnerImageBlock({
  block,
  onUpdate,
}: {
  block: WorkshopBlock;
  onUpdate: (blockId: string, content: string, attrs?: any) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlVal, setUrlVal] = useState('');

  async function handleFileUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success) {
        onUpdate(block.id, '', { ...block.attrs, src: json.data.url, alt: file.name });
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  }, [block.id, block.attrs]);

  if (block.attrs?.src) {
    return (
      <div className="relative bg-muted rounded overflow-hidden">
        <img
          src={block.attrs.src}
          alt={block.attrs?.alt || 'Workshop image'}
          className="w-full h-auto object-contain"
        />
        {block.attrs?.caption && (
          <p className="text-[10px] text-muted-foreground text-center p-1">
            {block.attrs.caption}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded p-3 text-center text-xs text-muted-foreground transition-colors',
        isDragOver && 'border-primary bg-primary/5'
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = '';
        }}
      />
      {uploading ? (
        <p className="py-2">Uploading...</p>
      ) : urlMode ? (
        <div className="flex gap-1 items-center">
          <input
            type="url"
            value={urlVal}
            onChange={(e) => setUrlVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && urlVal.trim()) {
                onUpdate(block.id, '', { ...block.attrs, src: urlVal.trim() });
                setUrlMode(false);
                setUrlVal('');
              }
            }}
            placeholder="Paste image URL..."
            className="flex-1 text-xs bg-transparent border-0 outline-none"
            autoFocus
          />
          <button
            onClick={() => { setUrlMode(false); setUrlVal(''); }}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 py-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Upload className="h-3 w-3" />
            Click to upload
          </button>
          <span className="text-[10px]">or</span>
          <button
            onClick={() => setUrlMode(true)}
            className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
          >
            Paste image URL
          </button>
        </div>
      )}
    </div>
  );
}

export function renderInnerBlock(
  block: WorkshopBlock,
  onUpdate: (blockId: string, content: string, attrs?: any) => void,
  size: 'sm' | 'md' = 'sm'
) {
  const linkCls =
    block.attrs?.link
      ? 'text-primary underline decoration-primary/30 hover:decoration-primary cursor-pointer'
      : '';

  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  switch (block.type) {
    case 'paragraph':
      return (
        <div className="group/block flex items-start">
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Text..."
            className={cn(
              'flex-1 resize-none bg-transparent border-0 outline-none p-1 min-h-[1.5rem]',
              textSize,
              linkCls
            )}
            rows={1}
          />
          <LinkField block={block} onUpdate={onUpdate} />
        </div>
      );
    case 'heading': {
      const level = block.attrs?.level || 3;
      const cls =
        level <= 2 ? 'text-base font-semibold' : 'text-sm font-medium';
      return (
        <div className="group/block flex items-start">
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Heading"
            className={cn(
              'flex-1 bg-transparent border-0 outline-none p-1',
              cls,
              linkCls
            )}
          />
          <LinkField block={block} onUpdate={onUpdate} />
        </div>
      );
    }
    case 'image':
      return (
        <InnerImageBlock block={block} onUpdate={onUpdate} />
      );
    case 'youtube': {
      const match = block.content?.match(
        /(?:v=|youtu\.be\/|embed\/)([^&?]+)/
      );
      const videoId = match?.[1];
      return videoId ? (
        <div className="relative aspect-video rounded overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <input
          type="url"
          value={block.content}
          onChange={(e) => onUpdate(block.id, e.target.value)}
          placeholder="YouTube URL..."
          className="w-full text-xs bg-muted rounded p-2 border-0 outline-none"
        />
      );
    }
    case 'quote':
      return (
        <div className="group/block flex items-start">
          <div className="border-l-4 border-primary pl-2 flex-1">
            <textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              placeholder="Quote..."
              className={cn(
                'w-full bg-transparent border-0 outline-none italic resize-none',
                textSize,
                linkCls
              )}
              rows={2}
            />
          </div>
          <LinkField block={block} onUpdate={onUpdate} />
        </div>
      );
    case 'code':
      return (
        <pre className="bg-muted rounded p-2 overflow-x-auto">
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Code..."
            className="w-full bg-transparent border-0 outline-none text-xs font-mono resize-none"
            rows={3}
            spellCheck={false}
          />
        </pre>
      );
    case 'divider':
      return <hr className="border-muted-foreground/30 my-1" />;
    case 'list':
      return (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate(block.id, e.target.value)}
          placeholder="List items (one per line)..."
          className="w-full bg-transparent border-0 outline-none text-sm resize-none"
          rows={3}
        />
      );
    case 'callout':
      return (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-2">
          <div className="group/block flex items-start">
            <textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              placeholder="Callout text..."
              className={cn(
                'flex-1 bg-transparent border-0 outline-none resize-none',
                textSize,
                linkCls
              )}
              rows={2}
            />
            <LinkField block={block} onUpdate={onUpdate} />
          </div>
        </div>
      );
    default:
      return (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate(block.id, e.target.value)}
          placeholder="Content..."
          className="w-full bg-transparent border-0 outline-none text-sm resize-none"
          rows={1}
        />
      );
  }
}
