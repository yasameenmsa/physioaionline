'use client';

import { useState, useRef } from 'react';
import { FileText, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';

interface BlockComponentProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
}

export function FileBlock({ block, isSelected, onSelect, onUpdate }: BlockComponentProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fileName = block.attrs?.fileName || '';
  const fileSize = block.attrs?.fileSize || 0;
  const fileUrl = block.attrs?.src || '';

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
        onUpdate('', {
          ...block.attrs,
          src: json.data.url,
          fileName: file.name,
          fileSize: file.size,
        });
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  if (fileUrl) {
    return (
      <div className={cn('p-2 rounded', isSelected && 'bg-muted/30')} onClick={onSelect}>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <FileText className="h-8 w-8 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            {fileSize > 0 && (
              <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
            )}
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className={cn('p-2 rounded', isSelected && 'bg-muted/30')} onClick={onSelect}>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleUpload}
      />
      <button
        className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        ) : (
          <div className="space-y-2">
            <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload a file</p>
          </div>
        )}
      </button>
    </div>
  );
}
