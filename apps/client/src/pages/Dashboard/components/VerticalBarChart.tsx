import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BarData {
  label: string;
  value: number;
  color: 'primary' | 'success' | 'warning' | 'accent';
}

interface VerticalBarChartProps {
  title: string;
  data: BarData[];
  className?: string;
}

const colorMap: Record<BarData['color'], string> = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  accent: 'hsl(var(--accent))',
};

export const VerticalBarChart = ({
  title,
  data,
  className,
}: VerticalBarChartProps) => {
  const maxValue = Math.max(...data.map((d) => d.value), 100);

  return (
    <Card className={cn(
      "bg-card border-border overflow-hidden",
      className
    )}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wider">
            {title}
          </h3>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Chart Area */}
        <div className="flex items-end justify-between gap-3 h-48">
          {data.map((item, idx) => {
            const heightPercent = (item.value / maxValue) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                {/* Bar Container */}
                <div className="relative w-full flex items-end justify-center" style={{ height: '140px' }}>
                  {/* Background track */}
                  <div className="absolute inset-0 w-8 mx-auto bg-muted/30 rounded-full" />

                  {/* Value label */}
                  <div
                    className="absolute w-full text-center text-xs font-medium text-foreground"
                    style={{ bottom: `${heightPercent}%`, transform: 'translateY(-8px)' }}
                  >
                    {item.value}
                  </div>

                  {/* Bar */}
                  <div
                    className="w-8 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{
                      height: `${heightPercent}%`,
                      minHeight: item.value > 0 ? '8px' : '0',
                      backgroundColor: colorMap[item.color],
                    }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>

                {/* Label */}
                <span className="text-xs text-muted-foreground truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend & Total */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Primary</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground">Valid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-xs text-muted-foreground">Needs Review</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Total: <span className="text-foreground font-medium">{data.reduce((sum, d) => sum + d.value, 0).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerticalBarChart;
