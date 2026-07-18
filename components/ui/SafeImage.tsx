'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function SafeImage({
  src,
  alt = '',
  fallback = '/placeholder.svg',
  className = '',
  fill = true,
  sizes,
  priority,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
        priority={priority}
        className="object-cover"
        onError={() => {
          if (imgSrc !== fallback) setImgSrc(fallback);
        }}
      />
    </div>
  );
}
