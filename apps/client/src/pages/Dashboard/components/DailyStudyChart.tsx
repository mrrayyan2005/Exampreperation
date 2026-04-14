import { motion } from 'framer-motion';
import { format, subDays, parseISO } from 'date-fns';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DailyStudyChartProps {
  dailyStudy?: Record<string, number>; // Real-time data from study sessions analytics
  daysToShow?: number;
}

export const DailyStudyChart = ({ dailyStudy = {}, daysToShow = 14 }: DailyStudyChartProps) => {
  // Generate last N days data from REAL study session analytics (no mock data)
  const generateDaysData = () => {
    const today = new Date();
    const days = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const hours = dailyStudy[dateStr] || 0;
      
      days.push({
        date: dateStr,
        dayName: format(date, 'EEE'),
        dayNumber: format(date, 'd'),
        hours: Math.round(hours * 10) / 10,
        isToday: i === 0,
      });
    }
    
    return days;
  };

  const daysData = generateDaysData();
  const maxHours = Math.max(...daysData.map(d => d.hours), 1);
  const totalHours = daysData.reduce((sum, d) => sum + d.hours, 0);
  const avgHours = totalHours / daysData.length;
  
  // Calculate trend
  const firstHalf = daysData.slice(0, Math.floor(daysData.length / 2));
  const secondHalf = daysData.slice(Math.floor(daysData.length / 2));
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.hours, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.hours, 0) / secondHalf.length;
  const trend = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'stable';
  const trendPercent = firstAvg > 0 ? Math.abs(Math.round(((secondAvg - firstAvg) / firstAvg) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Daily Study Hours</h3>
            <p className="text-sm text-muted-foreground">Last {daysToShow} days</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {trend !== 'stable' && (
            <Badge className={`${
              trend === 'up' 
                ? 'bg-success/20 text-success border-success/30' 
                : 'bg-warning/20 text-warning border-warning/30'
            } flex items-center gap-1`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendPercent}%
            </Badge>
          )}
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{Math.round(totalHours)}h</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative">
        {/* Average line */}
        {avgHours > 0 && (
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-primary/30 z-0"
            style={{ bottom: `${(avgHours / maxHours) * 100}%` }}
          >
            <span className="absolute -top-2.5 left-2 text-xs text-primary bg-card/95 backdrop-blur-sm px-2 py-1 rounded-md border border-primary/20 shadow-sm">
              Avg: {Math.round(avgHours * 10) / 10}h
            </span>
          </div>
        )}

        {/* Bars */}
        <div className="flex items-end justify-between gap-1.5 h-64 relative z-10">
          {daysData.map((day, index) => {
            const heightPercent = maxHours > 0 ? (day.hours / maxHours) * 100 : 0;
            
            return (
              <motion.div
                key={day.date}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                className="flex-1 flex flex-col items-center group"
              >
                {/* Bar */}
                <div className="w-full relative flex flex-col justify-end" style={{ height: '100%' }}>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.03 }}
                    className={`w-full rounded-t-xl relative overflow-hidden cursor-pointer transition-all duration-300 ${
                      day.isToday
                        ? 'bg-gradient-to-t from-primary to-primary/60 shadow-lg shadow-primary/20'
                        : day.hours >= avgHours
                        ? 'bg-gradient-to-t from-success to-success/60 hover:from-success/90 hover:to-success/70'
                        : 'bg-gradient-to-t from-warning to-warning/60 hover:from-warning/90 hover:to-warning/70'
                    } group-hover:scale-105 group-hover:shadow-xl`}
                    style={{ 
                      height: `${Math.max(heightPercent, 2)}%`,
                      minHeight: day.hours > 0 ? '8px' : '2px'
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                        <p className="text-xs font-medium text-foreground">
                          {format(parseISO(day.date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {day.hours}h
                        </p>
                        {day.isToday && (
                          <p className="text-xs text-muted-foreground">Today</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Day label */}
                <div className="mt-2 text-center">
                  <p className={`text-xs font-semibold ${
                    day.isToday ? 'text-primary' : 'text-foreground'
                  }`}>
                    {day.dayNumber}
                  </p>
                  <p className={`text-[10px] ${
                    day.isToday ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {day.dayName}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/60" />
          <span className="text-xs text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-success to-success/60" />
          <span className="text-xs text-muted-foreground">Above Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-warning to-warning/60" />
          <span className="text-xs text-muted-foreground">Below Average</span>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary/10 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Peak Day</p>
          <p className="text-2xl font-bold text-foreground">
            {Math.max(...daysData.map(d => d.hours))}h
          </p>
        </div>
        <div className="bg-success/10 backdrop-blur-sm rounded-xl p-4 border border-success/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Average</p>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(avgHours * 10) / 10}h
          </p>
        </div>
        <div className="bg-warning/10 backdrop-blur-sm rounded-xl p-4 border border-warning/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Days</p>
          <p className="text-2xl font-bold text-foreground">
            {daysData.filter(d => d.hours > 0).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyStudyChart;
