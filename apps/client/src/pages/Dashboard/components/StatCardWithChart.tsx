import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface StatCardWithChartProps {
  title: string;
  metrics: Array<{
    label: string;
    value: string;
    trend?: number[];
    color: string;
  }>;
  chartData?: Array<{ x: number; y1?: number; y2?: number }>;
  className?: string;
}

export const StatCardWithChart = ({
  title,
  metrics,
  chartData,
  className,
}: StatCardWithChartProps) => {
  const hasTrend = metrics.some((m) => m.trend && m.trend.length > 0);

  return (
    <Card className={cn(
      "bg-card border-border overflow-hidden",
      className
    )}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wider">
            {title}
          </h3>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {metrics.map((metric, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {metric.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mini Chart */}
        {chartData && chartData.length > 0 && (
          <div className="h-16 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="x" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line
                  type="monotone"
                  dataKey="y1"
                  stroke={metrics[0]?.color || 'hsl(var(--primary))'}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                {metrics[1] && (
                  <Line
                    type="monotone"
                    dataKey="y2"
                    stroke={metrics[1]?.color || 'hsl(var(--accent))'}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Dot Matrix Alternative (when no chart data) */}
        {!chartData && hasTrend && (
          <div className="flex gap-1 flex-wrap">
            {metrics.map((metric, idx) =>
              metric.trend?.map((active, dotIdx) => (
                <div
                  key={`${idx}-${dotIdx}`}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: active ? metric.color : 'hsl(var(--muted))',
                  }}
                />
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCardWithChart;
