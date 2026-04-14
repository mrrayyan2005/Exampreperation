import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';

export interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  data: number[];
  color?: string;
  prefix?: string;
  suffix?: string;
}

interface ProgressMetricsProps {
  metrics: MetricData[];
  title?: string;
  className?: string;
}

// Sparkline component for mini charts
const Sparkline = ({ data, color = 'hsl(var(--primary))', isPositive = true }: { data: number[]; color?: string; isPositive?: boolean }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const hasData = data.some(v => v > 0);

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  // Generate area path (closed)
  const areaPoints = `0,100 ${points} 100,100`;

  const strokeColor = isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
  const fillColor = isPositive ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--destructive) / 0.1)';

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={`gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fillColor} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <polygon
          points={areaPoints}
          fill={`url(#gradient-${color.replace(/[^a-zA-Z0-9]/g, '')})`}
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Empty state overlay */}
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground">No data</span>
        </div>
      )}
    </div>
  );
};

// Individual metric card
const MetricCard = ({ metric, index }: { metric: MetricData; index: number }) => {
  const isPositive = (metric.change ?? 0) >= 0;
  const isNeutral = metric.change === undefined || metric.change === 0;

  // Determine color based on change direction
  const getChangeColor = () => {
    if (isNeutral) return 'text-muted-foreground';
    return isPositive ? 'text-success' : 'text-destructive';
  };

  const getChangeBg = () => {
    if (isNeutral) return 'bg-muted/50';
    return isPositive ? 'bg-success/10' : 'bg-destructive/10';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    if (val >= 10000000) return `${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(2)}K`;
    return val.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 hover:bg-card/80 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-sm text-muted-foreground">{metric.label}</span>
        </div>
        {metric.change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getChangeColor()} ${getChangeBg()}`}>
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(metric.change)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-4">
        <span className="text-2xl md:text-3xl font-bold text-foreground">
          {metric.prefix}{formatValue(metric.value)}{metric.suffix}
        </span>
      </div>

      {/* Sparkline Chart */}
      <div className="h-16 w-full">
        <Sparkline data={metric.data} isPositive={isPositive} />
      </div>
    </motion.div>
  );
};

export const ProgressMetrics = ({ metrics, title = "Progress Insights", className = "" }: ProgressMetricsProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} metric={metric} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ProgressMetrics;
