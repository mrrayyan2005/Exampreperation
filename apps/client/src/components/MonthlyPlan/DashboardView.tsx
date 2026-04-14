import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MonthlyPlan } from '@/redux/slices/monthlyPlanSlice';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Target,
  TrendingUp,
  Calendar,
  Award,
  BarChart3
} from 'lucide-react';

interface DashboardViewProps {
  plans: MonthlyPlan[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ plans }) => {
  const stats = useMemo(() => {
    const total = plans.length;
    const completed = plans.filter(plan => plan.completed).length;
    const inProgress = plans.filter(plan => plan.status === 'In Progress').length;
    const overdue = plans.filter(plan => {
      const deadline = new Date(plan.deadline);
      const today = new Date();
      return deadline < today && !plan.completed;
    }).length;

    const upcomingDeadlines = plans.filter(plan => {
      const deadline = new Date(plan.deadline);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return deadline >= today && deadline <= nextWeek && !plan.completed;
    }).length;

    const overallProgress = total > 0 
      ? Math.round(plans.reduce((acc, plan) => acc + (plan.progressPercentage || 0), 0) / total)
      : 0;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      upcomingDeadlines,
      overallProgress,
      completionRate
    };
  }, [plans]);

  const priorityBreakdown = useMemo(() => {
    const high = plans.filter(plan => plan.priority === 'High').length;
    const medium = plans.filter(plan => plan.priority === 'Medium').length;
    const low = plans.filter(plan => plan.priority === 'Low').length;
    return { high, medium, low };
  }, [plans]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Plans */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur border-border/50 transition-all hover:shadow-md hover:bg-card group">
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-110" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Plans
          </CardTitle>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
             <Target className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold tracking-tight">{stats.total}</div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
            <div className="flex flex-col items-center bg-muted/40 rounded-md p-1.5 border border-border/50">
              <div className="text-red-500 font-bold">{priorityBreakdown.high}</div>
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider">High</div>
            </div>
            <div className="flex flex-col items-center bg-muted/40 rounded-md p-1.5 border border-border/50">
              <div className="text-yellow-500 font-bold">{priorityBreakdown.medium}</div>
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Med</div>
            </div>
            <div className="flex flex-col items-center bg-muted/40 rounded-md p-1.5 border border-border/50">
              <div className="text-green-500 font-bold">{priorityBreakdown.low}</div>
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur border-border/50 transition-all hover:shadow-md hover:bg-card group">
        <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/10 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-110" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completion Rate
          </CardTitle>
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold tracking-tight">
            {stats.completionRate}%
          </div>
          <div className="mt-4 space-y-2">
            <Progress value={stats.completionRate} className="h-1.5 [&>div]:bg-green-500" />
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
               <span>Progress</span>
               <span>{stats.completed}/{stats.total} completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur border-border/50 transition-all hover:shadow-md hover:bg-card group">
        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-110" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            In Progress
          </CardTitle>
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold tracking-tight">
            {stats.inProgress}
          </div>
          <div className="mt-4 space-y-2">
             <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
               <span>Overall Volume</span>
               <span>{stats.overallProgress}%</span>
             </div>
            <Progress value={stats.overallProgress} className="h-1.5 [&>div]:bg-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur border-border/50 transition-all hover:shadow-md hover:bg-card group">
        <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/10 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-110" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Needs Attention
          </CardTitle>
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border border-border/50">
              <span className="text-sm font-medium">Overdue</span>
              <Badge variant={stats.overdue > 0 ? "destructive" : "secondary"} className="text-xs px-2 py-0.5">
                {stats.overdue}
              </Badge>
            </div>
            <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border border-border/50">
              <span className="text-sm font-medium">Due Soon</span>
              <Badge variant={stats.upcomingDeadlines > 0 ? "default" : "secondary"} className={stats.upcomingDeadlines > 0 ? "bg-orange-500 text-white" : ""}>
                {stats.upcomingDeadlines}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
