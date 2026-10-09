import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackTitle?: string;
  containerClassName?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  fallbackTitle,
  containerClassName = '',
  className = '',
  loading = 'lazy',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[var(--brand-primary)] text-[var(--brand-canvas)] p-8 text-center ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-6 h-6 text-[var(--brand-accent)] mb-3 opacity-80" />
        <p className="font-serif-display text-lg tracking-wide text-[var(--brand-canvas)]">
          {fallbackTitle || 'Aurel Architectural Interior'}
        </p>
        <p className="text-xs text-[var(--brand-surface)]/70 mt-1 max-w-xs">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};
