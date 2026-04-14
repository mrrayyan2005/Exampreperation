import { useState, useEffect, useCallback } from 'react';
import { webVitalsMonitor } from '@/utils/webVitals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Gauge, Timer, Zap } from 'lucide-react';

interface MetricDisplay {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
  icon: React.ReactNode;
}

const METRIC_CONFIG: Record<string, { label: string; unit: string; icon: React.ReactNode }> = {
  LCP: { label: 'Largest Contentful Paint', unit: 'ms', icon: <Timer className="h-4 w-4" /> },
  FID: { label: 'First Input Delay', unit: 'ms', icon: <Zap className="h-4 w-4" /> },
  INP: { label: 'Interaction to Next Paint', unit: 'ms', icon: <Activity className="h-4 w-4" /> },
  CLS: { label: 'Cumulative Layout Shift', unit: '', icon: <Gauge className="h-4 w-4" /> },
  FCP: { label: 'First Contentful Paint', unit: 'ms', icon: <Timer className="h-4 w-4" /> },
  TTFB: { label: 'Time to First Byte', unit: 'ms', icon: <Timer className="h-4 w-4" /> },
};

function formatMetric(metric: ReturnType<typeof webVitalsMonitor.getMetrics>[0]): MetricDisplay {
  const config = METRIC_CONFIG[metric.name] || { label: metric.name, unit: '', icon: null };
  return {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    unit: config.unit,
    icon: config.icon,
  };
}

function getRatingColor(rating: string) {
  switch (rating) {
    case 'good':
      return 'bg-green-500/20 text-green-600 border-green-500/30';
    case 'needs-improvement':
      return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    case 'poor':
      return 'bg-red-500/20 text-red-600 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  }
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<MetricDisplay[]>([]);

  // Stable callback for metric updates
  const updateMetrics = useCallback(() => {
    const rawMetrics = webVitalsMonitor.getMetrics();
    setMetrics(rawMetrics.map(formatMetric));
  }, []);

  useEffect(() => {
    // Initialize once
    webVitalsMonitor.initialize();
    
    // Subscribe to updates first
    const unsubscribe = webVitalsMonitor.subscribe(updateMetrics);
    
    // Defer initial load to avoid synchronous setState
    const timer = setTimeout(updateMetrics, 0);
    
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [updateMetrics]);

  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading metrics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Core Web Vitals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className={`flex items-center justify-between p-3 rounded-lg border ${getRatingColor(
              metric.rating
            )}`}
          >
            <div className="flex items-center gap-3">
              {metric.icon}
              <div>
                <p className="text-xs font-medium">
                  {METRIC_CONFIG[metric.name]?.label || metric.name}
                </p>
                <p className="text-xs capitalize opacity-80">{metric.rating.replace(/-/g, ' ')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                {metric.unit === '' ? metric.value.toFixed(3) : Math.round(metric.value)}
                {metric.unit && <span className="text-xs ml-1">{metric.unit}</span>}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// For dev tools overlay
export function PerformanceOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Use typeof window to detect client-side without useEffect
  const isClient = typeof window !== 'undefined';

  if (!isClient || process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
        title="Toggle Performance Monitor"
      >
        <Activity className="h-5 w-5" />
      </button>
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-80">
          <PerformanceMonitor />
        </div>
      )}
    </>
  );
}