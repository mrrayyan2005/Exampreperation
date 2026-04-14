import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchMonthlyPlans, addMonthlyPlan, updateMonthlyPlan, deleteMonthlyPlan, updateMonthlyPlanProgress, MonthlyPlan as MonthlyPlanType } from '@/redux/slices/monthlyPlanSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, CheckCircle2, Minus, Target, Clock, AlertTriangle, TrendingUp, Grid3X3, Calendar, LayoutDashboard, Brain, Settings, ChevronLeft, ChevronRight, Filter, BookOpen, Clock3, Layers, Hash, CalendarDays, Zap, Medal, BookMarked } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, addMonths, subMonths, startOfMonth, isSameMonth } from 'date-fns';

// Import new components
import DashboardView from '@/components/MonthlyPlan/DashboardView';
import CalendarView from '@/components/MonthlyPlan/CalendarView';
import FilterAndSearch from '@/components/MonthlyPlan/FilterAndSearch';
import ProgressCharts from '@/components/MonthlyPlan/ProgressCharts';
import PerformanceAnalytics from '@/components/MonthlyPlan/PerformanceAnalytics';
import StrategyCanvas from '@/components/MonthlyPlan/StrategyCanvas';
import { FlowchartLink } from '@/components/MonthlyPlan/FlowchartLink';

// Import Smart Form components
import {
  SmartFormProvider,
  TextField,
  TextAreaField,
  NumberField,
  VisualSelect,
  FormWizard,
  useWizard,
  Celebration,
  type VisualOption,
  type WizardStep,
} from '@/components/forms';
import { monthlyPlanSchema, type MonthlyPlanFormData } from '@/lib/formSchemas';

const MonthlyPlan = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { plans, isLoading } = useAppSelector((state) => state.monthlyPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [filteredPlans, setFilteredPlans] = useState<MonthlyPlanType[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDatePlans, setSelectedDatePlans] = useState<{ date: Date; plans: MonthlyPlanType[] } | null>(null);
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'progress' | 'created'>('deadline');
  const [showCelebration, setShowCelebration] = useState(false);
  const wizard = useWizard(3);

  // Default values for Smart Form - useMemo to prevent frequent resets
  const defaultFormValues: MonthlyPlanFormData = useMemo(() => ({
    subject: '',
    target: '',
    deadline: format(new Date(), 'yyyy-MM-dd'),
    targetType: 'chapters',
    targetAmount: 1,
    priority: 'Medium',
  }), []);
  const [formData, setFormData] = useState<MonthlyPlanFormData>(defaultFormValues);
  const [resetKey, setResetKey] = useState(0);

  const monthPlans = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    return plans.filter(plan => {
      const planDeadline = new Date(plan.deadline);
      return isSameMonth(planDeadline, monthStart);
    });
  }, [plans, currentMonth]);

  // Default sorting/filtering when FilterAndSearch is outside the render flow
  useEffect(() => {
    // Apply sorting
    const sorted = [...monthPlans].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'priority': {
          const priorityOrder = { High: 0, Medium: 1, Low: 2 };
          return priorityOrder[a.priority || 'Medium'] - priorityOrder[b.priority || 'Medium'];
        }
        case 'progress':
          return (b.progressPercentage || 0) - (a.progressPercentage || 0);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredPlans(sorted);
  }, [monthPlans, sortBy]);

  const handlePreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleCurrentMonth = () => setCurrentMonth(new Date());

  useEffect(() => {
    dispatch(fetchMonthlyPlans());
  }, [dispatch]);

  // Smart Form submission handler
  const handleFormSubmit = async (data: MonthlyPlanFormData) => {
    // Robust duplicate check
    const isDuplicate = plans.some(p => {
      const pDate = new Date(p.deadline);
      const dDate = new Date(data.deadline);
      return (
        p.subject.toLowerCase().trim() === data.subject.toLowerCase().trim() && 
        pDate.getMonth() === dDate.getMonth() &&
        pDate.getFullYear() === dDate.getFullYear() &&
        p.id !== editingPlan
      );
    });

    if (isDuplicate) {
      toast({ 
        variant: 'destructive', 
        title: 'Plan already exists', 
        description: `You already have a plan for "${data.subject}" in March 2026.`
      });
      return;
    }

    try {
      if (editingPlan) {
        const result = await dispatch(updateMonthlyPlan({ id: editingPlan, data })).unwrap();
        if (result.success || result) {
          toast({ title: 'Plan updated successfully' });
          setIsDialogOpen(false);
          resetForm();
        }
      } else {
        const result = await dispatch(addMonthlyPlan(data)).unwrap();
        if (result.success || result) {
          setShowCelebration(true);
          setIsDialogOpen(false);
          resetForm();
          // Clear form data after success
          setFormData(defaultFormValues);
        }
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Form Submission Error',
        description: typeof error === 'string' ? error : (error?.message || 'Please check your inputs and try again.')
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteMonthlyPlan(id));
      toast({ title: 'Plan deleted successfully' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Delete failed' });
    }
  };

  const handleToggleComplete = async (plan: MonthlyPlanType) => {
    try {
      await dispatch(updateMonthlyPlan({ id: plan.id, data: { completed: !plan.completed } }));
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  const handleProgressUpdate = async (plan: MonthlyPlanType, increment: number) => {
    const newAmount = Math.max(0, Math.min(plan.targetAmount, plan.completedAmount + increment));
    try {
      await dispatch(updateMonthlyPlanProgress({ id: plan.id, completedAmount: newAmount }));
      toast({ title: 'Progress updated successfully' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to update progress' });
    }
  };

  const handleEdit = (plan: MonthlyPlanType) => {
    setEditingPlan(plan.id);
    setFormData({
      subject: plan.subject,
      target: plan.target || plan.description || '',
      deadline: plan.deadline,
      targetType: plan.targetType || 'chapters',
      targetAmount: plan.targetAmount || 1,
      priority: plan.priority || 'Medium',
    });
    setResetKey(prev => prev + 1);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(defaultFormValues);
    setEditingPlan(null);
    setResetKey(prev => prev + 1);
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-l-red-500';
      case 'Medium': return 'border-l-yellow-500';
      case 'Low': return 'border-l-green-500';
      default: return 'border-l-primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'In Progress': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'Paused': return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const uniquePastPlans = Array.from(new Set(plans.map(p => p.subject))).map(subject => {
    return plans.find(p => p.subject === subject);
  }).filter(Boolean) as MonthlyPlanType[];

  const targetTypeOptions: VisualOption[] = [
    { value: 'chapters', label: 'Chapters', icon: BookOpen, color: 'bg-blue-500' },
    { value: 'pages', label: 'Pages', icon: Layers, color: 'bg-indigo-500' },
    { value: 'topics', label: 'Topics', icon: Hash, color: 'bg-purple-500' },
    { value: 'hours', label: 'Hours', icon: Clock3, color: 'bg-orange-500' },
  ];

  const priorityOptions: VisualOption[] = [
    { value: 'High', label: 'High', icon: AlertTriangle, color: 'bg-red-500', description: 'Immediate attention' },
    { value: 'Medium', label: 'Medium', icon: Zap, color: 'bg-yellow-500', description: 'Standard pace' },
    { value: 'Low', label: 'Low', icon: Target, color: 'bg-green-500', description: 'When possible' },
  ];

  const wizardSteps: WizardStep[] = [
    {
      id: 'goal',
      label: 'Goal',
      description: 'Define what you want to achieve',
      fields: ['subject', 'target'],
      component: (
        <div className="space-y-6">
          {uniquePastPlans.length > 0 && !editingPlan && (
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Re-add</Label>
              <div className="flex flex-wrap gap-2">
                {uniquePastPlans.slice(0, 4).map((plan, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-muted/30 hover:bg-primary/10 hover:border-primary transition-all"
                    onClick={() => {
                        setFormData({
                            ...formData,
                            subject: plan.subject,
                            target: plan.target || plan.description || 'Complete ' + plan.subject,
                            targetType: plan.targetType || 'chapters',
                            targetAmount: plan.targetAmount || 1,
                            priority: plan.priority || 'Medium',
                        });
                        setResetKey(prev => prev + 1);
                    }}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {plan.subject}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <TextField
              name="subject"
              label="Subject"
              placeholder="e.g., Quantum Physics"
              required
            />
            <TextAreaField
              name="target"
              label="What's the objective?"
              placeholder="e.g., Complete all practice sets and review theory"
              required
            />
          </div>
        </div>
      )
    },
    {
      id: 'targets',
      label: 'Targets',
      description: 'Set your measurable goals',
      fields: ['targetType', 'targetAmount', 'priority'],
      component: (
        <div className="space-y-6">
          <VisualSelect
            name="targetType"
            label="Measure by"
            options={targetTypeOptions}
            columns={4}
            required
          />
          <NumberField
            name="targetAmount"
            label="How many?"
            min={1}
            required
          />
          <VisualSelect
            name="priority"
            label="Priority Level"
            options={priorityOptions}
            columns={3}
            required
          />
        </div>
      )
    },
    {
      id: 'schedule',
      label: 'Schedule',
      description: 'When should this be done?',
      fields: ['deadline'],
      component: (
        <div className="space-y-6">
          <TextField
              name="deadline"
              label="Target Deadline"
              type="date"
              required
            />
          <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-border/60">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="font-bold text-sm">Almost there!</h4>
                   <p className="text-xs text-muted-foreground mt-1">Review your plan details and hit complete to start tracking.</p>
                </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 p-4 sm:space-y-6 sm:p-6"
    >
      {showCelebration && (
        <Celebration
          show={showCelebration}
          title="New Goal Set!"
          message="Your monthly plan has been created. Time to crush it!"
          onClose={() => setShowCelebration(false)}
        />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Monthly <span className="text-primary">Plan</span></h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">Set and track your monthly study targets</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[140px] text-center">
            <span className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
            {!isSameMonth(currentMonth, new Date()) && (
              <Button variant="ghost" size="sm" onClick={handleCurrentMonth} className="ml-2 text-xs">
                Today
              </Button>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); wizard.reset(); }} className="w-full sm:w-auto transition-all duration-200">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Plan</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg mx-auto p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            <div className="bg-primary p-6 text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <DialogTitle className="text-2xl font-bold relative z-10">
                    {editingPlan ? 'Refine Plan' : 'Strategize Your Month'}
                </DialogTitle>
                <p className="text-primary-foreground/80 text-sm mt-1 relative z-10">
                    {editingPlan ? 'Update your existing study target' : 'Let\'s break down your academic goals'}
                </p>
            </div>
            
            <div className="p-6">
                <SmartFormProvider
                    key={resetKey}
                    schema={monthlyPlanSchema}
                    defaultValues={formData}
                    onSubmit={handleFormSubmit}
                >
                    <FormWizard
                        steps={wizardSteps}
                        currentStep={wizard.currentStep}
                        onStepChange={wizard.goToStep}
                        onComplete={() => {}} // Form submission is handled by SmartFormProvider
                        className="wizard-minimal"
                    />
                </SmartFormProvider>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading...</p>
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden xs:inline">Dashboard</span>
              <span className="xs:hidden">Dash</span>
            </TabsTrigger>
            <TabsTrigger value="grid" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden xs:inline">Grid View</span>
              <span className="xs:hidden">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Calendar className="h-4 w-4" />
              <span className="hidden xs:inline">Calendar</span>
              <span className="xs:hidden">Cal</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden xs:inline">Charts</span>
              <span className="xs:hidden">Chart</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Target className="h-4 w-4" />
              <span className="hidden xs:inline">Analytics</span>
              <span className="xs:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Brain className="h-4 w-4" />
              <span className="hidden xs:inline">Strategy</span>
              <span className="xs:hidden">Plan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardView plans={plans} />

            {/* Recent Plans Preview */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight">Recent Plans</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {plans.slice(0, 6).map((plan) => (
                  <Card key={plan.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/40 border-l-4 ${getPriorityBorder(plan.priority || 'Medium')} bg-card group`}>
                    <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-125"></div>
                    <CardHeader className="p-4 pb-2 relative z-10">
                      <CardTitle className="flex items-center gap-3 text-base font-semibold leading-tight">
                        <button onClick={() => handleToggleComplete(plan)}>
                          {plan.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-[2px] border-muted-foreground/40 hover:border-primary transition-colors" />
                          )}
                        </button>
                        <span className={plan.completed ? 'line-through text-muted-foreground' : ''}>
                          {plan.subject}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-3 relative z-10">
                      <p className="text-xs text-muted-foreground line-clamp-2">{plan.target}</p>
                      {plan.targetAmount && plan.targetAmount > 0 && (
                        <div className="space-y-1">
                          <Progress value={plan.progressPercentage || 0} className="h-1" />
                          <span className="text-xs text-muted-foreground">
                            {plan.progressPercentage || 0}% Complete
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="grid" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <FilterAndSearch
                plans={monthPlans}
                onFilterChange={(filtered) => {
                  // Apply sorting to filtered results
                  const sorted = [...filtered].sort((a, b) => {
                    switch (sortBy) {
                      case 'deadline':
                        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                      case 'priority': {
                        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
                        return priorityOrder[a.priority || 'Medium'] - priorityOrder[b.priority || 'Medium'];
                      }
                      case 'progress':
                        return (b.progressPercentage || 0) - (a.progressPercentage || 0);
                      case 'created':
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      default:
                        return 0;
                    }
                  });
                  setFilteredPlans(sorted);
                }}
              />

              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/40 border-l-4 ${getPriorityBorder(plan.priority || 'Medium')} bg-card group`}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-125"></div>
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <CardTitle className="flex items-start gap-3 text-lg font-bold leading-tight">
                          <button onClick={() => handleToggleComplete(plan)} className="mt-0.5 shrink-0">
                            {plan.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-[2px] border-muted-foreground/40 hover:border-primary transition-colors" />
                            )}
                          </button>
                          <span className={plan.completed ? 'line-through text-muted-foreground' : ''}>
                            {plan.subject}
                          </span>
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2 pl-8">
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(plan.status || 'Not Started')}
                            <span className="text-xs font-medium text-muted-foreground">
                              {plan.status || 'Not Started'}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {plan.priority || 'Medium'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary backdrop-blur-sm" onClick={() => handleEdit(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive backdrop-blur-sm" onClick={() => handleDelete(plan.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    <p className="text-sm text-foreground">{plan.target}</p>

                    {/* Progress Section */}
                    {plan.targetAmount && plan.targetAmount > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {plan.completedAmount || 0} / {plan.targetAmount} {plan.targetType || 'items'}
                          </span>
                        </div>
                        <Progress
                          value={plan.progressPercentage || 0}
                          className="h-2"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-primary">
                            {plan.progressPercentage || 0}% Complete
                          </span>
                          {!plan.completed && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleProgressUpdate(plan, -1)}
                                disabled={!plan.completedAmount || plan.completedAmount <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleProgressUpdate(plan, 1)}
                                disabled={plan.completedAmount >= plan.targetAmount}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Deadline and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(plan.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {isOverdue(plan.deadline) && !plan.completed && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                        {plan.completed && (
                          <Badge className="bg-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Flowchart Integration */}
                    <FlowchartLink monthlyPlanId={plan.id} monthlyPlanSubject={plan.subject} />
                  </CardContent>
                </Card>
              ))}
              {filteredPlans.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">
                  {plans.length === 0 ? 'No monthly plans yet. Start by adding your targets!' : 'No plans match your current filters.'}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView
              plans={filteredPlans}
              onDateSelect={(date, plans) => {
                setSelectedDatePlans({ date, plans });
              }}
              onToggleComplete={handleToggleComplete}
            />
            {/* Date Plans Modal */}
            {selectedDatePlans && (
              <Dialog open={!!selectedDatePlans} onOpenChange={() => setSelectedDatePlans(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Plans for {format(selectedDatePlans.date, 'MMMM d, yyyy')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {selectedDatePlans.plans.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No plans for this date.</p>
                    ) : (
                      selectedDatePlans.plans.map(plan => (
                        <Card key={plan.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{plan.subject}</h4>
                              <p className="text-sm text-muted-foreground">{plan.target}</p>
                              <Badge variant={plan.completed ? 'default' : 'outline'} className="mt-2">
                                {plan.completed ? 'Completed' : 'In Progress'}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <ProgressCharts plans={plans} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PerformanceAnalytics plans={plans} />
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6 h-full">
            <StrategyCanvas />
          </TabsContent>

        </Tabs>
      )}
    </motion.div>
  );
};

export default MonthlyPlan;
