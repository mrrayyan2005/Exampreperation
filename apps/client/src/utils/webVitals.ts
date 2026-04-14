import type { CLSMetric, FCPMetric, INPMetric, LCPMetric, TTFBMetric, Metric } from 'web-vitals';

type WebVitalsMetric = CLSMetric | FCPMetric | INPMetric | LCPMetric | TTFBMetric;

interface WebVitalsReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
}

// Thresholds based on Core Web Vitals
const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: string, value: number): WebVitalsReport['rating'] {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

class WebVitalsMonitor {
  private metrics: Map<string, WebVitalsReport> = new Map();
  private listeners: Set<(metric: WebVitalsReport) => void> = new Set();
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Dynamically import web-vitals to avoid increasing initial bundle
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS((metric) => this.handleMetric(metric));
      onINP((metric) => this.handleMetric(metric));
      onFCP((metric) => this.handleMetric(metric));
      onLCP((metric) => this.handleMetric(metric));
      onTTFB((metric) => this.handleMetric(metric));
    }).catch((err) => {
      console.warn('[WebVitals] Failed to load:', err);
    });
  }

  private handleMetric(metric: Metric): void {
    const report: WebVitalsReport = {
      name: metric.name,
      value: metric.value,
      rating: getRating(metric.name, metric.value),
      delta: metric.delta,
      id: metric.id,
      navigationType: (metric as any).navigationType,
    };

    this.metrics.set(metric.name, report);
    this.listeners.forEach((listener) => listener(report));

    // Log poor metrics in development
    if (process.env.NODE_ENV === 'development' && report.rating === 'poor') {
      console.warn(`[WebVitals] Poor ${metric.name}:`, report.value);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(report);
    }
  }

  private sendToAnalytics(metric: WebVitalsReport): void {
    // Send to your analytics endpoint
    const payload = {
      ...metric,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(payload));
    } else {
      fetch('/api/analytics/vitals', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {
        // Silently fail - don't block user experience
      });
    }

    // Also send to Sentry if available
    if (window.Sentry && metric.rating === 'poor') {
      window.Sentry.captureMessage(`Poor ${metric.name}`, {
        level: 'warning',
        extra: metric,
      });
    }
  }

  subscribe(listener: (metric: WebVitalsReport) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getMetrics(): WebVitalsReport[] {
    return Array.from(this.metrics.values());
  }

  getMetric(name: string): WebVitalsReport | undefined {
    return this.metrics.get(name);
  }
}

export const webVitalsMonitor = new WebVitalsMonitor();

// Hook for React components
export function useWebVitals(callback?: (metric: WebVitalsReport) => void) {
  if (callback) {
    return webVitalsMonitor.subscribe(callback);
  }
  return () => {};
}