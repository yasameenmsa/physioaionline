'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ImageUploadInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUploadInput({ id, value, onChange, placeholder, className }: ImageUploadInputProps) {
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        body: fd 
      });
      
      const data = await res.json();
      if (data.success) {
        onChange(data.data.url);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error: any) {
      alert(error.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
      // Reset input value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "https://example.com/image.jpg"}
        className="flex-1"
      />
      
      <div className="relative">
        <Button 
          type="button" 
          variant="secondary" 
          className="shrink-0"
          disabled={uploading}
          onClick={() => {
            document.getElementById(`upload-${id}`)?.click();
          }}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload
        </Button>
        <input 
          id={`upload-${id}`}
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="hidden" 
          disabled={uploading} 
        />
      </div>
    </div>
  );
}
