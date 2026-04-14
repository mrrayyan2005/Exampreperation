import React, { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { fetchBooks } from '@/redux/slices/bookSlice';
import { fetchStudySessions, fetchStudyAnalytics } from '@/redux/slices/studySessionSlice';
import StatCard from '@/components/StatCard';
import {
  BookOpen,
  Target,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  PlayCircle,
  AlertCircle,
  Award,
  BookMarked,
  Zap,
  BarChart3,
  Activity,
  Users,
  LayoutGrid,
  LayoutTemplate
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { differenceInDays } from 'date-fns';
import { ModernDashboard } from './ModernDashboardGlass';
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton';

const DASHBOARD_LAYOUT_KEY = 'dashboard-layout-preference';

type DashboardLayout = 'classic' | 'modern';

const getSavedLayout = (): DashboardLayout => {
  return (localStorage.getItem(DASHBOARD_LAYOUT_KEY) as DashboardLayout) || 'classic';
};

const saveLayout = (layout: DashboardLayout) => {
  localStorage.setItem(DASHBOARD_LAYOUT_KEY, layout);
};

// Memoize child components to prevent unnecessary re-renders
// StatCard with memo moved inside component or used directly


// Subject Distribution Chart component
const SubjectDistributionChart = ({ data }: { data: Array<{ name: string; value: number; color: string }> }) => {
  if (data.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Subject Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, 'Books']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {data.map((subject) => (
                <div key={subject.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="text-sm">{subject.name}</span>
                  <Badge variant="outline">{subject.value}%</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Quick Actions component
const QuickActions = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.15 }}
  >
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            className="flex items-center justify-center gap-2 h-11 sm:h-12 text-sm sm:text-base"
            onClick={() => onNavigate('/study-sessions')}
          >
            <PlayCircle className="h-4 w-4" />
            <span className="hidden xs:inline">Start Study Session</span>
            <span className="xs:hidden">Start Session</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 h-11 sm:h-12 text-sm sm:text-base"
            onClick={() => onNavigate('/track-my-progress')}
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden xs:inline">Track My Progress</span>
            <span className="xs:hidden">Track Progress</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 h-11 sm:h-12 text-sm sm:text-base sm:col-span-1"
            onClick={() => onNavigate('/student-grouping')}
          >
            <Users className="h-4 w-4" />
            <span className="hidden xs:inline">Instructional Grouping</span>
            <span className="xs:hidden">Grouping</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Analytics Card
const AnalyticsCard = ({ 
  analytics, 
  onNavigate 
}: { 
  analytics: {
    totalSessions?: number;
    totalHours?: number;
    averageProductivity?: number;
    streakDays?: number;
    peakDay?: string;
  } | null; 
  onNavigate: (path: string) => void;
}) => {
  if (!analytics) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.25 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Study Sessions Analytics
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => onNavigate('/study-sessions')}>
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard
              title="Total Sessions"
              value={analytics.totalSessions?.toString() || '0'}
              icon={BookOpen}
              color="primary"
            />
            <StatCard
              title="Study Hours"
              value={`${analytics.totalHours || 0}h`}
              icon={Clock}
              color="success"
            />
            <StatCard
              title="Avg Productivity"
              value={`${analytics.averageProductivity || 0}/5`}
              icon={TrendingUp}
              color="accent"
            />
            <StatCard
              title="Study Streak"
              value={`${analytics.streakDays || 0} days`}
              icon={Award}
              color="primary"
            />
            <StatCard
              title="Best Day Hours"
              value={analytics.peakDay}
              icon={Activity}
              color="accent"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Custom hook for time with reduced update frequency
const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  
  useEffect(() => {
    // Update time every 5 minutes instead of every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 300000);
    return () => clearInterval(timer);
  }, []);
  
  return currentTime;
};


// Custom hook for progressive data fetching - critical data first
const useDashboardData = () => {
  const dispatch = useAppDispatch();
  const [loadingStage, setLoadingStage] = useState<'critical' | 'secondary' | 'analytics' | 'complete'>('critical');
  
  useEffect(() => {
    // Stage 1: Critical data (books) - needed for basic dashboard
    const loadCritical = async () => {
      await dispatch(fetchBooks({}));
      setLoadingStage('secondary');
    };
    
    // Stage 2: Secondary data (study sessions)
    const loadSecondary = async () => {
      await dispatch(fetchStudySessions({ limit: 10 })); // Reduced from 20
      setLoadingStage('analytics');
    };
    
    // Stage 3: Analytics (can fail without breaking dashboard)
    const loadAnalytics = async () => {
      await dispatch(fetchStudyAnalytics('7d'));
      setLoadingStage('complete');
    };
    
    // Start loading sequence
    loadCritical().then(() => {
      // Load secondary and analytics in parallel after critical
      Promise.allSettled([loadSecondary(), loadAnalytics()]);
    });
  }, [dispatch]);
  
  return { loadingStage };
};



const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { books, isLoading: booksLoading } = useAppSelector((state) => state.books);
  const { sessions, analytics, isLoading: sessionsLoading } = useAppSelector((state) => state.studySessions);

  // Dashboard layout state
  const [layout, setLayout] = useState<DashboardLayout>(() => getSavedLayout());

  // Toggle layout handler
  const handleSwitchLayout = useCallback(() => {
    const newLayout = layout === 'classic' ? 'modern' : 'classic';
    setLayout(newLayout);
    saveLayout(newLayout);
  }, [layout]);

  // Use custom hook for time with reduced updates
  const currentTime = useCurrentTime();


  // Use custom hook for progressive data fetching
  const { loadingStage } = useDashboardData();

  // Show skeleton only for critical data (books)
  const isInitialLoading = booksLoading && books.length === 0;

  // Use React Query hook for daily goals
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { goals, toggleGoal } = useDailyGoals(today);

  // Memoize navigation handler
  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // Memoize books array - MUST be before any conditional returns
  const booksArray = useMemo(() => Array.isArray(books) ? books : [], [books]);
  
  // Memoize goals array
  const goalsArray = useMemo(() => Array.isArray(goals) ? goals : [], [goals]);

  // Memoize calculated stats
  const stats = useMemo(() => {
    const totalBooks = booksArray.length;
    const completedGoals = goalsArray.filter((g) => g.completed).length;
    const totalGoals = goalsArray.length;
    const totalChapters = booksArray.reduce((sum, book) => sum + (book.totalChapters || 0), 0);
    const completedChapters = booksArray.reduce((sum, book) => sum + (book.completedChapters || 0), 0);
    const syllabusProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    return {
      totalBooks,
      completedGoals,
      totalGoals,
      totalChapters,
      completedChapters,
      syllabusProgress
    };
  }, [booksArray, goalsArray]);

  // Memoize exam countdown calculation
  const examInfo = useMemo(() => {
    const examDate = user?.examDate ? new Date(user.examDate) : null;
    const daysUntilExam = examDate ? differenceInDays(examDate, currentTime) : null;
    
    const getExamBadgeVariant = () => {
      if (!daysUntilExam) return 'secondary';
      if (daysUntilExam <= 7) return 'destructive';
      if (daysUntilExam <= 30) return 'default';
      return 'secondary';
    };
    
    return { daysUntilExam, getExamBadgeVariant };
  }, [user?.examDate, currentTime]);

  // Memoize subject data generation - only recalculate when books change
  const subjectData = useMemo(() => {
    if (!booksArray.length) return [];

    const subjectCounts = booksArray.reduce((acc, book) => {
      const subject = book.subject || 'General';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#696FC7', '#A7AAE1', '#F5D3C4', '#F2AEBB', '#B8E6B8', '#FFD93D'];

    return Object.entries(subjectCounts).map(([name, count], index) => ({
      name,
      value: Math.round((count / booksArray.length) * 100),
      color: colors[index % colors.length]
    }));
  }, [booksArray]);

  // Memoize enhanced analytics calculation
  const enhancedAnalytics = useMemo(() => {
    if (!analytics || !sessions) return null;

    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    if (sessionsArray.length === 0) return null;

    // Calculate peak day based on total study hours per day
    const dailyStudyTime = sessionsArray.reduce((acc, session) => {
      const sessionDate = new Date(session.startTime).toDateString();
      const durationInHours = session.duration / 60; // Convert minutes to hours

      acc[sessionDate] = (acc[sessionDate] || 0) + durationInHours;
      return acc;
    }, {} as Record<string, number>);

    const peakDay = Object.entries(dailyStudyTime).reduce((best, [date, hours]) =>
      hours > best.hours ? { date, hours } : best
      , { date: 'No data', hours: 0 });

    const peakDayFormatted = peakDay.hours > 0 ?
      `${peakDay.hours.toFixed(1)}h` :
      '0h';

    // Calculate study streak - consecutive days with at least one session
    const studyDates = [...new Set(sessionsArray.map(session =>
      new Date(session.startTime).toDateString()
    ))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate: Date | null = null;

    for (const dateStr of studyDates) {
      const currentDate = new Date(dateStr);

      if (lastDate === null) {
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }

      maxStreak = Math.max(maxStreak, currentStreak);
      lastDate = currentDate;
    }

    // Check if streak continues to today
    const todayStr = new Date().toDateString();
    const lastStudyDate = studyDates[studyDates.length - 1];
    const daysSinceLastStudy = lastStudyDate ?
      Math.floor((new Date(todayStr).getTime() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24)) :
      Infinity;

    const activeStreak = daysSinceLastStudy <= 1 ? currentStreak : 0;

    return {
      ...analytics,
      peakDay: peakDayFormatted,
      streakDays: activeStreak,
      totalSessions: analytics.totalSessions || sessionsArray.length,
      totalHours: analytics.totalHours || Math.round(Object.values(dailyStudyTime).reduce((a, b) => a + b, 0)),
      averageProductivity: analytics.averageProductivity || 0
    };
  }, [analytics, sessions]);

  // Memoize quick action handlers
  const handleStartStudySession = useCallback(() => navigate('/study-sessions'), [navigate]);
  const handleAddDailyGoal = useCallback(() => navigate('/daily-goals'), [navigate]);
  const handleMarkChapterDone = useCallback(() => navigate('/subjects'), [navigate]);
  const handleAccessResources = useCallback(() => navigate('/books'), [navigate]);

  // Memoize filtered goals to prevent recalculation
  const todaysGoals = useMemo(() => goalsArray.slice(0, 3), [goalsArray]);
  const upcomingGoals = useMemo(() => 
    goalsArray.filter(goal => !goal.completed).slice(0, 3), 
    [goalsArray]
  );

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }

  // Render modern dashboard layout
  if (layout === 'modern') {
    return <ModernDashboard onSwitchLayout={handleSwitchLayout} />;
  }

  // Render classic dashboard layout
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header with Exam Countdown */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Welcome back, <span className="text-primary">{user?.name || 'Student'}</span>!
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Your personal study dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Layout Switcher */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchLayout}
              className="gap-2"
              title="Switch to Modern Dashboard"
            >
              <LayoutTemplate className="h-4 w-4" />
              <span className="hidden sm:inline">Modern View</span>
            </Button>
            {examInfo.daysUntilExam !== null && (
              <Badge
                variant={examInfo.getExamBadgeVariant()}
                className="text-sm sm:text-base px-3 sm:px-4 py-2 font-medium"
              >
                <Clock className="mr-2 h-4 w-4" />
                {examInfo.daysUntilExam > 0 ? `${examInfo.daysUntilExam} days until exam` : 'Exam today!'}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Quick Stats Row - Only Real Data */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <StatCard
            title="Total Subjects"
            value={stats.totalBooks.toString()}
            icon={BookOpen}
            color="primary"
          />
          <StatCard
            title="Daily Goals"
            value={`${stats.completedGoals}/${stats.totalGoals}`}
            icon={Target}
            color="success"
          />
          <StatCard
            title="Syllabus Progress"
            value={`${stats.syllabusProgress}%`}
            icon={BookMarked}
            color="accent"
          />
        </motion.div>

        {/* Quick Actions Panel */}
        <QuickActions onNavigate={handleNavigate} />

        {/* Subject Distribution Chart */}
        <SubjectDistributionChart data={subjectData} />

        {/* Study Sessions Analytics Overview */}
        <AnalyticsCard analytics={enhancedAnalytics} onNavigate={handleNavigate} />

        {/* Progress and Goals Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Today's Goals and Upcoming */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Goals & Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Today's Goals */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Today's Tasks
                </h4>
                <div className="space-y-3">
                  {todaysGoals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className="flex items-center gap-3 w-full text-left hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 shrink-0 ${goal.completed
                          ? 'border-green-500 bg-green-500'
                          : 'border-muted-foreground hover:border-primary'
                          }`}
                      >
                        {goal.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span
                        className={`text-sm ${goal.completed
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                          }`}
                      >
                        {goal.task}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upcoming Tasks */}
              {stats.totalGoals > stats.completedGoals && upcomingGoals.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Upcoming Tasks
                  </h4>
                  <div className="space-y-2">
                    {upcomingGoals.map((goal, index) => (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between p-2 rounded-lg border-l-4 bg-muted/30"
                        style={{
                          borderLeftColor: `hsl(${200 + index * 30}, 70%, 60%)`
                        }}
                      >
                        <span className="text-sm">{goal.task}</span>
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(goalsArray.length === 0) && (
                <div className="text-center py-4">
                  <Target className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No goals set for today. Start planning your day!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Study Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5" />
                Study Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Syllabus Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Syllabus Completion</span>
                  <span className="text-sm text-muted-foreground">{stats.syllabusProgress}%</span>
                </div>
                <Progress value={stats.syllabusProgress} className="h-2" />
              </div>

              {/* Chapters Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Chapters Completed</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.completedChapters}/{stats.totalChapters}
                  </span>
                </div>
                <Progress 
                  value={stats.totalChapters > 0 ? (stats.completedChapters / stats.totalChapters) * 100 : 0} 
                  className="h-2" 
                />
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.totalBooks}</p>
                  <p className="text-xs text-muted-foreground">Total Subjects</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.completedGoals}/{stats.totalGoals}</p>
                  <p className="text-xs text-muted-foreground">Goals Today</p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/track-my-progress')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Detailed Progress
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Row - Insights & Resources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Study Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Study Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.syllabusProgress > 0 && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-green-800">🎯 Great Progress!</p>
                  <p className="text-sm text-green-600">
                    {stats.syllabusProgress}% of your syllabus completed
                  </p>
                </div>
              )}

              {stats.completedGoals > 0 && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">✅ Goals Achieved</p>
                  <p className="text-sm text-blue-600">
                    {stats.completedGoals} out of {stats.totalGoals} daily goals completed
                  </p>
                </div>
              )}

              {stats.totalBooks > 5 && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm font-medium text-purple-800">📚 Great Library</p>
                  <p className="text-sm text-purple-600">
                    {stats.totalBooks} books in your study collection
                  </p>
                </div>
              )}

              {(!stats.syllabusProgress && !stats.completedGoals && stats.totalBooks === 0) && (
                <div className="text-center py-4">
                  <Award className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start studying to see your insights here!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/subjects')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Syllabus
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/monthly-plan')}
              >
                <Target className="mr-2 h-4 w-4" />
                Monthly Plans
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/study-sessions')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Study Sessions
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.completedGoals > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Completed {stats.completedGoals} daily goal{stats.completedGoals > 1 ? 's' : ''}</span>
                  <span className="text-muted-foreground ml-auto">Today</span>
                </div>
              )}

              {booksArray.length > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Added {booksArray.length} book{booksArray.length > 1 ? 's' : ''} to library</span>
                  <span className="text-muted-foreground ml-auto">Recent</span>
                </div>
              )}

              {stats.syllabusProgress > 50 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Great progress on syllabus completion</span>
                  <span className="text-muted-foreground ml-auto">Active</span>
                </div>
              )}

              {(!stats.completedGoals && !booksArray.length && stats.syllabusProgress === 0) && (
                <div className="text-center py-4">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your recent activities will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;