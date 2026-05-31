'use client';

import { useState } from 'react';

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  fallback?: string;
}

export function SafeImage({ src, fallback = '/placeholder.svg', alt, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallback)}
      {...props}
    />
  );
}
