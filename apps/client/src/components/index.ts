// Performance & Optimization
export { PerformanceMonitor, PerformanceOverlay } from './Performance';
export { PrefetchLink } from './PrefetchLink';
export { ResponsiveImage } from './ResponsiveImage';

// Re-export hooks from their own files (for Fast Refresh compatibility)
export { usePrefetch } from '@/hooks/usePrefetch';
export { useImagePreload } from '@/hooks/useImagePreload';

// Error Boundaries
export { RouteErrorBoundary } from './ErrorBoundaries';
export { default as ErrorBoundary } from './ErrorBoundary';

// Re-export from lib
export * from '@/lib/motion';
