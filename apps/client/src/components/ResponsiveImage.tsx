import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Source image URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Width of the image */
  width?: number;
  /** Height of the image */
  height?: number;
  /** Aspect ratio (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string;
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Whether to use lazy loading */
  lazy?: boolean;
  /** Placeholder color while loading */
  placeholderColor?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Additional class names */
  className?: string;
  /** Priority loading (above the fold) */
  priority?: boolean;
}

/**
 * Responsive Image Component with WebP/AVIF support
 * 
 * Features:
 * - Automatic WebP/AVIF format detection and fallback
 * - Responsive srcset generation
 * - Lazy loading with Intersection Observer
 * - Skeleton placeholder while loading
 * - Automatic aspect ratio preservation
 * 
 * Usage:
 * <ResponsiveImage
 *   src="/images/hero.jpg"
 *   alt="Hero image"
 *   width={1200}
 *   height={600}
 *   aspectRatio="16/9"
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   lazy
 * />
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  aspectRatio,
  objectFit = 'cover',
  sizes = '100vw',
  lazy = true,
  placeholderColor = '#f3f4f6',
  onLoad,
  onError,
  className,
  priority = false,
  ...props
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  // Generate responsive srcset
  const generateSrcSet = () => {
    if (!src) return '';
    
    // If src already has query params or is external, return as-is
    if (src.includes('?') || src.startsWith('http')) {
      return src;
    }

    const widths = [320, 640, 960, 1280, 1920];
    return widths
      .map((w) => {
        // Check if we have WebP/AVIF versions
        // This assumes your build process generates these formats
        // Format: /images/hero-640w.webp, /images/hero-640w.avif
        return `${src}?w=${w} ${w}w`;
      })
      .join(', ');
  };

  // Generate picture source for modern formats
  const generatePictureSources = () => {
    if (!src || src.startsWith('http')) return null;

    const basePath = src.replace(/\.[^/.]+$/, '');
    const ext = src.split('.').pop();

    return (
      <>
        {/* AVIF - best compression */}
        <source
          srcSet={generateSrcSet().replace(/\?w=/g, '.avif?w=').replace(/\.[^.?]+(?=\?|$)/g, '.avif')}
          type="image/avif"
          sizes={sizes}
        />
        {/* WebP - good compression, wide support */}
        <source
          srcSet={generateSrcSet().replace(/\?w=/g, '.webp?w=').replace(/\.[^.?]+(?=\?|$)/g, '.webp')}
          type="image/webp"
          sizes={sizes}
        />
        {/* Original format as fallback */}
        <source srcSet={generateSrcSet()} type={`image/${ext === 'jpg' ? 'jpeg' : ext}`} sizes={sizes} />
      </>
    );
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
        backgroundColor: placeholderColor,
      }}
    >
      {isInView && !error && (
        <picture className="contents">
          {generatePictureSources()}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'w-full h-full transition-opacity duration-300',
              objectFit === 'cover' && 'object-cover',
              objectFit === 'contain' && 'object-contain',
              objectFit === 'fill' && 'object-fill',
              objectFit === 'none' && 'object-none',
              objectFit === 'scale-down' && 'object-scale-down',
              !isLoaded && 'opacity-0',
              isLoaded && 'opacity-100'
            )}
            {...props}
          />
        </picture>
      )}

      {/* Loading skeleton */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

// Hook moved to src/hooks/useImagePreload.ts for Fast Refresh compatibility
