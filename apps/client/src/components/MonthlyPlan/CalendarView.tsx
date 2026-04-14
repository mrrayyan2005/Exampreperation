import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonthlyPlan } from '@/redux/slices/monthlyPlanSlice';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertTriangle, Clock, MoreHorizontal, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import CalendarSettings, { ItemStyle } from './CalendarSettings';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalendarViewProps {
  plans: MonthlyPlan[];
  onDateSelect?: (date: Date, plansForDate: MonthlyPlan[]) => void;
  onToggleComplete?: (plan: MonthlyPlan) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ plans, onDateSelect, onToggleComplete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // View Settings State
  const [itemStyle, setItemStyle] = useState<ItemStyle>('modern');
  const [showCheckboxes, setShowCheckboxes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const { calendarGrid, monthPlans, maxDailyTasks } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

    // Calculate days from previous month to fill grid
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Grid generation (always 6 rows for consistency or 5 if fits)
    const grid: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      grid.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // Next month days to fill 42 cells (6 rows * 7 cols)
    const remainingCells = 42 - grid.length;
    for (let day = 1; day <= remainingCells; day++) {
      grid.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    // Group plans by date string (YYYY-MM-DD) for easy lookup
    const plansByDate: Record<string, MonthlyPlan[]> = {};
    let maxTasks = 0;

    plans.forEach(plan => {
      const dateStr = new Date(plan.deadline).toDateString();
      if (!plansByDate[dateStr]) plansByDate[dateStr] = [];
      plansByDate[dateStr].push(plan);
    });

    // Find max tasks for heatmap normalization
    Object.values(plansByDate).forEach(dailyPlans => {
      maxTasks = Math.max(maxTasks, dailyPlans.length);
    });

    return {
      calendarGrid: grid,
      monthPlans: plansByDate,
      maxDailyTasks: maxTasks || 1
    };
  }, [currentDate, plans]);

  const navigateMonth = (direction: 'prev' | 'next' | 'today') => {
    setCurrentDate(prev => {
      if (direction === 'today') return new Date();

      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900';
      case 'Low': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getHeatmapColor = (taskCount: number) => {
    if (!showHeatmap || taskCount === 0) return '';
    const intensity = Math.min(taskCount / maxDailyTasks, 1);
    // Determine opacity based on intensity (0.1 to 0.4)
    const opacity = 0.1 + (intensity * 0.3);
    return `rgba(59, 130, 246, ${opacity})`; // Blue base
  };

  const renderTaskItem = (plan: MonthlyPlan, isCompact: boolean) => {
    const isOverdue = new Date(plan.deadline) < new Date() && !plan.completed;

    if (itemStyle === 'modern') {
      return (
        <div
          key={plan.id}
          className={cn(
            "text-[10px] truncate px-1 rounded-sm border cursor-pointer transition-all hover:opacity-80 flex items-center gap-1",
            getPriorityColor(plan.priority || 'Medium'),
            plan.completed && "opacity-50 line-through grayscale bg-muted border-transparent"
          )}
          onClick={(e) => {
            e.stopPropagation();
            // onDateSelect?.(new Date(plan.deadline), [plan]); // Or open edit modal directly
          }}
        >
          {showCheckboxes && !isCompact && (
            <div
              className={cn(
                "h-2 w-2 rounded-[2px] border border-current flex-shrink-0 flex items-center justify-center",
                plan.completed && "bg-current"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete?.(plan);
              }}
            >
              {plan.completed && <CheckCircle2 className="h-2 w-2 text-background stroke-[4]" />}
            </div>
          )}
          <span className="truncate flex-1">{plan.subject}</span>
          {isOverdue && !plan.completed && <AlertTriangle className="h-2 w-2 text-red-500 flex-shrink-0" />}
        </div>
      );
    }

    // Classic Style
    return (
      <div
        key={plan.id}
        className={cn(
          "flex items-center gap-1 text-[10px] text-foreground truncate cursor-pointer hover:bg-muted/50 rounded px-0.5",
          plan.completed && "text-muted-foreground line-through"
        )}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
          plan.priority === 'High' ? 'bg-red-500' :
            plan.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
        )} />
        <span className="truncate">{plan.subject}</span>
      </div>
    );
  };

  return (
    <Card className="w-full h-full flex flex-col shadow-sm border-border/50">
      <CardHeader className="py-4 px-6 border-b">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </CardTitle>
            <div className="flex items-center rounded-md border shadow-sm">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 rounded-none border-x px-3 font-normal" onClick={() => navigateMonth('today')}>
                Today
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarSettings
              itemStyle={itemStyle}
              setItemStyle={setItemStyle}
              showCheckboxes={showCheckboxes}
              setShowCheckboxes={setShowCheckboxes}
              showHeatmap={showHeatmap}
              setShowHeatmap={setShowHeatmap}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-auto">
        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={day} className={cn(
              "py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider",
              (i === 0 || i === 6) && "text-red-500/70" // Highlight weekends
            )}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Body */}
        <div className="grid grid-cols-7 auto-rows-fr h-[600px] min-h-[500px]">
          {calendarGrid.map((cell, index) => {
            const dateKey = cell.date.toDateString();
            const dailyPlans = monthPlans[dateKey] || [];
            const isCurrentDay = isToday(cell.date);
            const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[80px] border-b border-r p-1 transition-colors relative flex flex-col group",
                  !cell.isCurrentMonth && "bg-muted/10 text-muted-foreground/50",
                  cell.isCurrentMonth && "bg-background",
                  isWeekend && cell.isCurrentMonth && "bg-muted/5",
                  "hover:bg-accent/5",
                  index % 7 === 0 && "border-l" // Left border for first column
                )}
                style={{ backgroundColor: cell.isCurrentMonth ? getHeatmapColor(dailyPlans.length) : undefined }}
                onClick={() => onDateSelect?.(cell.date, dailyPlans)}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full transition-colors",
                    isCurrentDay ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                    !cell.isCurrentMonth && "opacity-50"
                  )}>
                    {cell.date.getDate()}
                  </span>
                  {/* Add Button on Hover (optional) */}
                </div>

                {/* Tasks List */}
                <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                  {dailyPlans.slice(0, 4).map(plan => renderTaskItem(plan, false))}

                  {dailyPlans.length > 4 && (
                    <div className="text-[10px] text-muted-foreground pl-1 font-medium">
                      +{dailyPlans.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
