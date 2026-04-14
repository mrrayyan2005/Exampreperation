import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type TimeRange = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type DataView = 'success_rate' | 'study_hours' | 'goals' | 'errors';

export interface TrendDataPoint {
  timestamp: string;
  label: string;
  [key: string]: string | number;
}

export interface TrendSeries {
  id: string;
  name: string;
  color: string;
  dataKey: string;
  visible: boolean;
  average?: number;
}

interface StudyProgressTrendsProps {
  data: TrendDataPoint[];
  series: TrendSeries[];
  title?: string;
  timeRange?: TimeRange;
  dataView?: DataView;
  onTimeRangeChange?: (range: TimeRange) => void;
  onDataViewChange?: (view: DataView) => void;
  className?: string;
  showFilters?: boolean;
  height?: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg p-3 shadow-xl min-w-[200px]">
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Legend item with toggle
const LegendItem = ({
  series,
  onToggle,
}: {
  series: TrendSeries;
  onToggle: (id: string) => void;
}) => {
  return (
    <button
      onClick={() => onToggle(series.id)}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200',
        series.visible
          ? 'bg-card/80 border border-border/50 hover:bg-card'
          : 'bg-muted/50 border border-transparent opacity-50 hover:opacity-75'
      )}
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: series.visible ? series.color : 'hsl(var(--muted-foreground))' }}
      />
      <span className="font-medium text-foreground">{series.name}</span>
      {series.average !== undefined && (
        <span className="text-muted-foreground">
          {series.average.toFixed(2)}%
        </span>
      )}
    </button>
  );
};

export const StudyProgressTrends = ({
  data,
  series,
  title = 'Study Progress Trends',
  timeRange = 'hourly',
  dataView = 'success_rate',
  onTimeRangeChange,
  onDataViewChange,
  className = '',
  showFilters = true,
  height = 400,
}: StudyProgressTrendsProps) => {
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>(() =>
    series.reduce((acc, s) => ({ ...acc, [s.id]: s.visible }), {})
  );

  // Toggle series visibility
  const toggleSeries = (id: string) => {
    setVisibleSeries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate averages for the legend
  const seriesWithAverages = useMemo(() => {
    return series.map((s) => ({
      ...s,
      average: data.length
        ? data.reduce((sum, d) => sum + (Number(d[s.dataKey]) || 0), 0) / data.length
        : 0,
    }));
  }, [series, data]);

  // Get active series
  const activeSeries = seriesWithAverages.filter((s) => visibleSeries[s.id]);

  // Get view label
  const getViewLabel = (view: DataView) => {
    switch (view) {
      case 'success_rate':
        return 'Study Success Rate';
      case 'study_hours':
        return 'Study Hours';
      case 'goals':
        return 'Daily Goals Completion';
      case 'errors':
        return 'Error Trends';
      default:
        return 'Study Success Rate';
    }
  };

  // Get time range label
  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case 'hourly':
        return 'Hourly';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'Hourly';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden',
        className
      )}
    >
      {/* Header with filters */}
      {showFilters && (
        <div className="p-6 border-b border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left side - Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Top X Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/70"
                  >
                    Top 5 <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Top 5</DropdownMenuItem>
                  <DropdownMenuItem>Top 10</DropdownMenuItem>
                  <DropdownMenuItem>All</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Time Range Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/70"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {getTimeRangeLabel(timeRange)} <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(['hourly', 'daily', 'weekly', 'monthly'] as TimeRange[]).map((range) => (
                    <DropdownMenuItem
                      key={range}
                      onClick={() => onTimeRangeChange?.(range)}
                    >
                      {getTimeRangeLabel(range)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Error Trends Filter */}
              <Button
                variant="outline"
                className="rounded-full bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/70"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Error Trends
              </Button>
            </div>

            {/* Right side - Data View */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/70"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {getViewLabel(dataView)} <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(['success_rate', 'study_hours', 'goals', 'errors'] as DataView[]).map(
                  (view) => (
                    <DropdownMenuItem
                      key={view}
                      onClick={() => onDataViewChange?.(view)}
                    >
                      {getViewLabel(view)}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-6 py-4 border-b border-border/50">
        <div className="flex flex-wrap items-center gap-3">
          {/* Overall badge */}
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5"
          >
            <div className="w-2 h-2 rounded-full bg-primary mr-2" />
            Overall{' '}
            {activeSeries.length > 0
              ? (
                  activeSeries.reduce((sum, s) => sum + (s.average || 0), 0) /
                  activeSeries.length
                ).toFixed(2)
              : 0}
            %
          </Badge>

          {/* Series toggles */}
          {seriesWithAverages.map((s) => (
            <LegendItem
              key={s.id}
              series={{ ...s, visible: visibleSeries[s.id] }}
              onToggle={toggleSeries}
            />
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6" style={{ height }}>
        {data.length === 0 || series.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              No Study Data Yet
            </h4>
            <p className="text-sm text-muted-foreground max-w-xs">
              Start studying to see your progress trends. Complete sessions to track your performance over time.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border) / 0.5)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />

              {seriesWithAverages.map(
                (s) =>
                  visibleSeries[s.id] && (
                    <Line
                      key={s.id}
                      type="monotone"
                      dataKey={s.dataKey}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        stroke: 'hsl(var(--background))',
                      }}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default StudyProgressTrends;
