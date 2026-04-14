import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MonthlyPlan } from '@/redux/slices/monthlyPlanSlice';
import * as Recharts from 'recharts';
const {
  LineChart: LineChartAny,
  Line: LineAny,
  XAxis: XAxisAny,
  YAxis: YAxisAny,
  CartesianGrid: CartesianGridAny,
  Tooltip: TooltipAny,
  Legend: LegendAny,
  ResponsiveContainer: ResponsiveContainerAny,
  BarChart: BarChartAny,
  Bar: BarAny,
  PieChart: PieChartAny,
  Pie: PieAny,
  Cell: CellAny
} = Recharts as any;
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react';

interface ProgressChartsProps {
  plans: MonthlyPlan[];
}

const ProgressCharts: React.FC<ProgressChartsProps> = ({ plans }) => {
  // Remove fake daily progress since we don't have real daily tracking data

  const subjectProgressData = useMemo(() => {
    return plans.map(plan => ({
      subject: plan.subject,
      progress: plan.progressPercentage || 0,
      completed: plan.completedAmount || 0,
      target: plan.targetAmount || 0,
    }));
  }, [plans]);

  const priorityDistribution = useMemo(() => {
    const distribution = plans.reduce((acc, plan) => {
      const priority = plan.priority || 'Medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([priority, count]) => ({
      name: priority,
      value: count,
      color: priority === 'High' ? '#ef4444' : priority === 'Medium' ? '#f59e0b' : '#22c55e'
    }));
  }, [plans]);

  const weeklyTrend = useMemo(() => {
    if (plans.length === 0) return [];

    // Generate real weekly data based on actual plan progress
    const avgProgress = plans.reduce((acc, plan) => acc + (plan.progressPercentage || 0), 0) / plans.length;
    const completedPlans = plans.filter(plan => plan.completed).length;
    const totalPlans = plans.length;

    return [
      {
        week: 'Current Week',
        progress: Math.round(avgProgress),
        completedPlans: completedPlans,
        totalPlans: totalPlans
      }
    ];
  }, [plans]);

  const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Removed Daily Progress Trend - no real daily tracking data available */}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subject Progress Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Subject Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainerAny width="100%" height={250}>
              <BarChartAny data={subjectProgressData}>
                <CartesianGridAny strokeDasharray="3 3" />
                <XAxisAny dataKey="subject" />
                <YAxisAny />
                <TooltipAny formatter={(value, name) => [`${value}%`, 'Progress']} />
                <BarAny dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChartAny>
            </ResponsiveContainerAny>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainerAny width="100%" height={250}>
              <PieChartAny>
                <PieAny
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityDistribution.map((entry, index) => (
                    <CellAny key={`cell-${index}`} fill={entry.color} />
                  ))}
                </PieAny>
                <TooltipAny />
              </PieChartAny>
            </ResponsiveContainerAny>
          </CardContent>
        </Card>
      </div>

      {/* Current Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Current Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Average Progress</h4>
              <div className="text-2xl font-bold text-blue-600">
                {weeklyTrend[0]?.progress || 0}%
              </div>
              <p className="text-xs text-muted-foreground">Across all plans</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Completed Plans</h4>
              <div className="text-2xl font-bold text-green-600">
                {weeklyTrend[0]?.completedPlans || 0}
              </div>
              <p className="text-xs text-muted-foreground">Out of {weeklyTrend[0]?.totalPlans || 0} total</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Completion Rate</h4>
              <div className="text-2xl font-bold text-purple-600">
                {weeklyTrend[0] ? Math.round((weeklyTrend[0].completedPlans / weeklyTrend[0].totalPlans) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Monthly plans</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Removed Performance Insights section - no real backend data available */}
    </div>
  );
};

export default ProgressCharts;
