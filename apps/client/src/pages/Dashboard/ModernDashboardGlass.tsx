import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/redux/hooks';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import type { Book } from '@/redux/slices/bookSlice';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  LayoutGrid,
  Target,
  Clock,
  CheckCircle2,
  Flame,
  BookOpen,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectsTimeline } from './components/ProjectsTimeline';
import { DailyStudyChart } from './components/DailyStudyChart';
import { ProgressMetrics } from './components/ProgressMetrics';
import { StudyProgressTrends, type TimeRange, type DataView } from './components/StudyProgressTrends';
import { useTrendData, useProgressMetrics, useRevisionMetrics } from './hooks/useProgressData';
import type { StudySession } from '@/api/studySessionApi';
import { format, differenceInDays, subDays } from 'date-fns';

interface ModernDashboardProps {
  onSwitchLayout: () => void;
}

// Generate study timeline
const generateStudyTimeline = (sessions: StudySession[]) => {
  const sorted = [...sessions]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 7);

  const colors = [
    'hsl(var(--success))',
    'hsl(var(--primary))',
    'hsl(var(--warning))',
    'hsl(var(--accent))',
  ];

  return sorted.map((session, i) => ({
    id: session._id,
    name: session.subject || 'Study Session',
    startDate: format(new Date(session.startTime), 'yyyy-MM-dd'),
    duration: Math.max(Math.round(session.duration / 60), 1),
    color: colors[i % colors.length],
  }));
};

export const ModernDashboard = ({ onSwitchLayout }: ModernDashboardProps) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { books } = useAppSelector((state) => state.books);
  const { sessions, analytics } = useAppSelector((state) => state.studySessions);

  const today = format(new Date(), 'yyyy-MM-dd');
  const { goals } = useDailyGoals(today);

  const booksArray = useMemo(() => Array.isArray(books) ? books : [], [books]);
  const goalsArray = useMemo(() => Array.isArray(goals) ? goals : [], [goals]);
  const sessionsArray = useMemo(() => Array.isArray(sessions) ? sessions : [], [sessions]);

  // Progress tracking state
  const [timeRange, setTimeRange] = useState<TimeRange>('hourly');
  const [dataView, setDataView] = useState<DataView>('success_rate');

  // Get trend data and metrics
  const { data: trendData, series: trendSeries } = useTrendData(timeRange, dataView, sessionsArray);
  const progressMetrics = useProgressMetrics(sessionsArray, goalsArray, booksArray);
  const savedOrdersMetrics = useRevisionMetrics(sessionsArray);

  // Calculate stats
  const stats = useMemo(() => {
    const totalBooks = booksArray.length;
    const totalGoals = goalsArray.length;
    const completedGoals = goalsArray.filter(g => g.completed).length;
    const totalSessions = sessionsArray.length;
    const totalHours = sessionsArray.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

    const totalChapters = booksArray.reduce((sum, book) => sum + (book.totalChapters || 0), 0);
    const completedChapters = booksArray.reduce((sum, book) => sum + (book.completedChapters || 0), 0);
    const syllabusProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    // Calculate syllabus progress change (first half vs second half of last 14 days)
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      return date.toDateString();
    });

    const dailyCompletedChapters = last14Days.map(day => {
      // Count completed sessions as a proxy for chapter progress change
      return sessionsArray.filter(s =>
        new Date(s.startTime).toDateString() === day && s.completed
      ).length;
    });

    const firstHalfChapters = dailyCompletedChapters.slice(0, 7).reduce((a, b) => a + b, 0);
    const secondHalfChapters = dailyCompletedChapters.slice(7).reduce((a, b) => a + b, 0);
    const progressChange = firstHalfChapters > 0
      ? Math.round(((secondHalfChapters - firstHalfChapters) / firstHalfChapters) * 100)
      : (secondHalfChapters > 0 ? 100 : 0);

    // Calculate study hours goal (40h baseline, can be user-configurable later)
    const studyHoursGoal = 40;
    const hoursProgress = Math.min(Math.round((totalHours / studyHoursGoal) * 100), 100);

    return {
      totalBooks,
      totalGoals,
      completedGoals,
      totalSessions,
      totalHours,
      totalChapters,
      completedChapters,
      syllabusProgress,
      progressChange,
      studyHoursGoal,
      hoursProgress,
    };
  }, [booksArray, goalsArray, sessionsArray]);

  const examInfo = useMemo(() => {
    const examDate = user?.examDate ? new Date(user.examDate) : null;
    const daysUntilExam = examDate ? differenceInDays(examDate, new Date()) : null;
    return { examDate, daysUntilExam };
  }, [user?.examDate]);

  const studyStreak = useMemo(() => {
    if (!analytics?.dailyStudy) return 0;
    const dates = Object.keys(analytics.dailyStudy).sort().reverse();
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');

    for (const date of dates) {
      const daysDiff = differenceInDays(new Date(today), new Date(date));
      if (daysDiff === streak && analytics.dailyStudy[date] > 0) {
        streak++;
      } else{
        break;
      }
    }
    return streak;
  }, [analytics]);

  const studyTimeline = useMemo(() => generateStudyTimeline(sessionsArray), [sessionsArray]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">
              <span className="text-foreground">Analytics </span>
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Track your performance and study insights
            </p>
          </motion.div>

          {/* Filters & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="rounded-full px-5 py-2.5 h-auto bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/70 transition-all"
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Date: Now <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-border">
                <DropdownMenuItem>Today</DropdownMenuItem>
                <DropdownMenuItem>This Week</DropdownMenuItem>
                <DropdownMenuItem>This Month</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="rounded-full px-5 py-2.5 h-auto bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/70 transition-all"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Subject: All <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-border">
                <DropdownMenuItem>All Subjects</DropdownMenuItem>
                {booksArray.map((book: Book) => (
                  <DropdownMenuItem key={book.id}>{book.title}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              onClick={onSwitchLayout}
              className="w-11 h-11 rounded-full bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/70 transition-all"
              title="Switch to Classic Dashboard"
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Top Stats Grid - 2 Large Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Study Performance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 hover:bg-card/80 transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Syllabus Progress
                  </h3>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.syllabusProgress}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <Badge className={cn(
                  "border-success/30",
                  stats.progressChange >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                )}>
                  {stats.progressChange >= 0 ? '+' : ''}{stats.progressChange}%
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed: {stats.completedChapters}</span>
                <span className="text-muted-foreground">Total: {stats.totalChapters}</span>
              </div>
              <Progress value={stats.syllabusProgress} className="h-3 bg-muted/30" />
            </div>

            {/* Visual Dots Indicator */}
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < Math.floor(stats.syllabusProgress / 5)
                      ? 'bg-primary scale-110'
                      : 'bg-muted/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Study Hours Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 hover:bg-card/80 transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-warning/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Study Hours
                  </h3>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.totalHours}h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-warning" />
                <Badge className="bg-warning/20 text-warning border-warning/30">Weekly</Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goal: {stats.studyHoursGoal}h/week</span>
                <span className="text-muted-foreground">{stats.hoursProgress}%</span>
              </div>
              <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-warning to-warning/60 rounded-full transition-all duration-500"
                  style={{ width: `${stats.hoursProgress}%` }}
                />
              </div>
            </div>

            {/* Visual Dots Indicator */}
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < Math.floor((stats.hoursProgress / 100) * 20)
                      ? 'bg-warning scale-110'
                      : 'bg-muted/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Middle Section - 4 Small Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:bg-card/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                {examInfo.daysUntilExam !== null ? `${examInfo.daysUntilExam}d` : 'N/A'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Exam Countdown</p>
            <p className="text-2xl font-bold text-foreground">
              {examInfo.daysUntilExam !== null ? (
                examInfo.daysUntilExam <= 7 ? 'Final Sprint!' : 'On Track'
              ) : (
                'Set Date'
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:bg-card/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-warning" />
              </div>
              <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">{studyStreak}d</Badge>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Study Streak</p>
            <p className="text-2xl font-bold text-foreground">
              {studyStreak > 5 ? 'On Fire!' : studyStreak > 0 ? 'Keep Going!' : 'Start'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:bg-card/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <Badge className="bg-success/20 text-success border-success/30 text-xs">
                {stats.completedGoals}/{stats.totalGoals}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Daily Goals</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalGoals > 0 ? `${Math.round((stats.completedGoals / stats.totalGoals) * 100)}%` : '0%'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:bg-card/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">{stats.totalBooks}</Badge>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Active Books</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalBooks > 0 ? `${stats.totalBooks} Books` : 'Add Books'}
            </p>
          </motion.div>
        </div>

        {/* Progress Insights - Sparkline Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mb-6"
        >
          <ProgressMetrics
            title="Study Insights"
            metrics={progressMetrics.slice(0, 8)}
          />
        </motion.div>

        {/* Recent Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Performance</h3>
          <ProgressMetrics
            metrics={progressMetrics.slice(0, 2)}
          />
        </motion.div>

        {/* Revision Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.44 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Revision Insights</h3>
          <ProgressMetrics
            metrics={savedOrdersMetrics}
          />
        </motion.div>

        {/* Study Progress Trends - Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.46 }}
          className="mb-6"
        >
          <StudyProgressTrends
            data={trendData}
            series={trendSeries}
            timeRange={timeRange}
            dataView={dataView}
            onTimeRangeChange={setTimeRange}
            onDataViewChange={setDataView}
            height={400}
          />
        </motion.div>

        {/* Daily Study Hours Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.48 }}
          className="mb-6"
        >
          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 hover:bg-card/80 transition-all duration-300 shadow-xl">
            <DailyStudyChart dailyStudy={analytics?.dailyStudy} daysToShow={14} />
          </div>
        </motion.div>

        {/* Bottom Section - Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 hover:bg-card/80 transition-all duration-300 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold uppercase tracking-wide text-foreground">Study Timeline</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-xs text-muted-foreground">Low</span>
              </div>
            </div>
          </div>
          <ProjectsTimeline 
            projects={studyTimeline.length > 0 ? studyTimeline : [{ 
              id: '1', 
              name: 'Start Studying', 
              startDate: format(new Date(), 'yyyy-MM-dd'), 
              duration: 1, 
              color: 'hsl(var(--primary))' 
            }]} 
          />
        </motion.div>
      </main>
    </div>
  );
};

export default ModernDashboard;
