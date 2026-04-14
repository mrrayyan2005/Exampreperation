// Global type declarations

interface Window {
  // Sentry error tracking
  Sentry?: {
    captureException: (error: Error, context?: Record<string, unknown>) => void;
    captureMessage: (message: string, context?: Record<string, unknown>) => void;
  };
  
  // Performance monitoring
  performance?: Performance;
  
  // Analytics
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
}

// Service Worker manifest for Workbox
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    revision: string | null;
    url: string;
  }>;
};

// Extend Navigator interface for PWA install prompt
interface Navigator {
  standalone?: boolean;
}