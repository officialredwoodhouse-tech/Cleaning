import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackTitle?: string;
  containerClassName?: string;
  /**
   * When true (default for non-eager images), uses IntersectionObserver to defer image loading
   * until the image container approaches the viewport.
   */
  lazyObserver?: boolean;
  /**
   * Root margin for the IntersectionObserver (default: '240px 0px').
   */
  observerRootMargin?: string;
  /**
   * Enables a smooth low-resolution blur-up placeholder effect while the image loads (default: true).
   */
  blurUp?: boolean;
}

/**
 * Generates an inline low-resolution blurred SVG placeholder data URI
 * with warm architectural stone, bronze, and slate tones.
 */
function createBlurPlaceholderDataUri(seedKey: string): string {
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash << 5) - hash + seedKey.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    ['#1c2636', '#3d4c5c', '#b88655', '#d9d2c5'],
    ['#261c17', '#4a3b32', '#c89d66', '#e5dec9'],
    ['#153d32', '#2d574b', '#c6a66b', '#e2dfd7'],
    ['#1b3644', '#395868', '#c4a47c', '#dfe4e8'],
  ];
  const [c1, c2, c3, c4] = palettes[Math.abs(hash) % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 20" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="50%" stop-color="${c2}" />
        <stop offset="100%" stop-color="${c4}" />
      </linearGradient>
      <radialGradient id="r" cx="70%" cy="35%" r="60%">
        <stop offset="0%" stop-color="${c3}" stop-opacity="0.55" />
        <stop offset="100%" stop-color="${c1}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="32" height="20" fill="url(#g)" />
    <rect width="32" height="20" fill="url(#r)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  fallbackTitle,
  containerClassName = '',
  className = '',
  loading = 'lazy',
  lazyObserver,
  observerRootMargin = '240px 0px',
  blurUp = true,
  onLoad,
  onError,
  ...rest
}) => {
  const isEager = loading === 'eager';
  const useObserver = lazyObserver !== undefined ? lazyObserver : !isEager;

  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState<boolean>(() => !useObserver);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const placeholderUri = useMemo(() => createBlurPlaceholderDataUri(src || alt), [src, alt]);

  // Reset loaded/error states when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    if (!useObserver) {
      setIsInView(true);
    }
  }, [src, useObserver]);

  // Check if already cached in browser
  useEffect(() => {
    if (isInView && imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [isInView, src]);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!useObserver || isInView) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const node = wrapperRef.current;
    if (!node) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIsInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        rootMargin: observerRootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [useObserver, isInView, observerRootMargin]);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[var(--brand-primary)] text-[var(--brand-canvas)] p-8 text-center w-full h-full ${containerClassName}`}
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
    <div
      ref={wrapperRef}
      className={`relative w-full h-full overflow-hidden ${containerClassName}`}
    >
      {/* Blur-Up Low-Resolution Placeholder Layer */}
      {blurUp && (
        <div
          aria-hidden="true"
          style={{
            backgroundImage: `url("${placeholderUri}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className={`absolute inset-0 z-10 pointer-events-none transform scale-110 filter blur-xl transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* Actual High-Resolution Image (mounted when IntersectionObserver triggers) */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={(e) => {
            setIsLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setHasError(true);
            onError?.(e);
          }}
          className={`${className} ${
            blurUp
              ? `transition-[opacity,transform,filter] duration-700 ease-out ${
                  isLoaded
                    ? 'opacity-100 scale-100 blur-0'
                    : 'opacity-0 scale-[1.03] blur-md'
                }`
              : ''
          }`}
          {...rest}
        />
      )}
    </div>
  );
};

