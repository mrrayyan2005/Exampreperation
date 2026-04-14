import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/redux/hooks';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import {
  ChevronDown,
  LayoutGrid,
  Target,
  Clock,
  PlayCircle,
  CheckCircle2,
  Circle,
  Flame,
  Award,
  ArrowRight,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatCardWithChart } from './components/StatCardWithChart';
import type { StudySession } from '@/api/studySessionApi';
import { ProjectsTimeline } from './components/ProjectsTimeline';
import { VerticalBarChart } from './components/VerticalBarChart';
import { format, subDays, differenceInDays } from 'date-fns';

interface ModernDashboardProps {
  onSwitchLayout: () => void;
}

// Generate chart data from real analytics
const generateChartDataFromAnalytics = (dailyStudy: Record<string, number>) => {
  const sortedDates = Object.entries(dailyStudy)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-12); // Last 12 days

  return sortedDates.map(([date, hours], i) => ({
    x: i,
    y1: hours,
    y2: hours * 0.8, // Slightly lower line for visual effect
  }));
};

// Generate weekly productivity data from real sessions
const generateWeeklyData = (sessions: StudySession[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayMap = new Map<string, { total: number; count: number }>();

  // Group sessions by day of week
  sessions.forEach(session => {
    const date = new Date(session.startTime);
    const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
    const existing = dayMap.get(dayName) || { total: 0, count: 0 };
    existing.total += session.productivity || 0;
    existing.count += 1;
    dayMap.set(dayName, existing);
  });

  // Calculate averages
  return days.map(day => {
    const data = dayMap.get(day);
    const avg = data && data.count > 0 ? Math.round(data.total / data.count) : 0;
    return {
      label: day,
      value: avg || 50, // Default to 50 if no data
      color: (avg >= 4 ? 'success' : avg >= 3 ? 'primary' : 'warning') as 'success' | 'primary' | 'warning',
    };
  });
};

// Generate study timeline from real sessions
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
    name: session.subject || session.topic || 'Study Session',
    startDate: format(new Date(session.startTime), 'yyyy-MM-dd'),
    duration: Math.max(Math.round(session.duration / 60), 1), // Convert to hours, min 1
    color: colors[i % colors.length],
  }));
};

export const ModernDashboard = ({ onSwitchLayout }: ModernDashboardProps) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { books } = useAppSelector((state) => state.books);
  const { sessions, analytics } = useAppSelector((state) => state.studySessions);

  // Get today's goals
  const today = format(new Date(), 'yyyy-MM-dd');
  const { goals, toggleGoal } = useDailyGoals(today);

  // Calculate real stats
  const booksArray = useMemo(() => Array.isArray(books) ? books : [], [books]);
  const goalsArray = useMemo(() => Array.isArray(goals) ? goals : [], [goals]);
  const sessionsArray = useMemo(() => Array.isArray(sessions) ? sessions : [], [sessions]);

  const stats = useMemo(() => {
    const totalBooks = booksArray.length;
    const completedGoals = goalsArray.filter((g) => g.completed).length;
    const totalGoals = goalsArray.length;
    const totalChapters = booksArray.reduce((sum, book) => sum + (book.totalChapters || 0), 0);
    const completedChapters = booksArray.reduce((sum, book) => sum + (book.completedChapters || 0), 0);
    const syllabusProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    // Calculate total study hours
    const totalMinutes = sessionsArray.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHours = Math.round(totalMinutes / 60);

    return {
      totalBooks,
      completedGoals,
      totalGoals,
      totalChapters,
      completedChapters,
      syllabusProgress,
      totalHours,
      totalSessions: sessionsArray.length,
    };
  }, [booksArray, goalsArray, sessionsArray]);

  // Exam countdown
  const examInfo = useMemo(() => {
    const examDate = user?.examDate ? new Date(user.examDate) : null;
    const daysUntilExam = examDate ? differenceInDays(examDate, new Date()) : null;
    return { daysUntilExam, examDate };
  }, [user?.examDate]);

  // Recent sessions (last 5)
  const recentSessions = useMemo(() => {
    return [...sessionsArray]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5);
  }, [sessionsArray]);

  // Study streak calculation
  const studyStreak = useMemo(() => {
    const studyDates = [...new Set(sessionsArray.map(session =>
      format(new Date(session.startTime), 'yyyy-MM-dd')
    ))].sort();

    let streak = 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    if (studyDates.includes(todayStr) || studyDates.includes(yesterdayStr)) {
      streak = 1;
      for (let i = studyDates.length - 1; i > 0; i--) {
        const current = new Date(studyDates[i]);
        const previous = new Date(studyDates[i - 1]);
        const diffDays = differenceInDays(current, previous);
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  }, [sessionsArray]);

  // Generate real chart data from analytics
  const customerChartData = useMemo(() => {
    if (analytics?.dailyStudy) {
      return generateChartDataFromAnalytics(analytics.dailyStudy);
    }
    // Fallback: generate from sessions
    const dailyStudy: Record<string, number> = {};
    sessionsArray.forEach(session => {
      const date = format(new Date(session.startTime), 'yyyy-MM-dd');
      dailyStudy[date] = (dailyStudy[date] || 0) + (session.duration / 60);
    });
    return generateChartDataFromAnalytics(dailyStudy);
  }, [analytics, sessionsArray]);

  // Generate real weekly productivity data
  const weeklyData = useMemo(() => generateWeeklyData(sessionsArray), [sessionsArray]);

  // Generate real study timeline
  const studyTimeline = useMemo(() =>
    sessionsArray.length > 0 ? generateStudyTimeline(sessionsArray) : [],
    [sessionsArray]
  );

  // Subject progress data
  const subjectProgress = useMemo(() => {
    const progress = booksArray.map(book => {
      const completed = book.completedChapters || 0;
      const total = book.totalChapters || 1;
      return {
        name: book.title || 'Unknown',
        subject: book.subject || 'General',
        progress: Math.round((completed / total) * 100),
        completed,
        total
      };
    });
    return progress.slice(0, 4);
  }, [booksArray]);

  const handleStartSession = () => navigate('/study-sessions');
  const handleViewGoals = () => navigate('/daily-goals');
  const handleViewBooks = () => navigate('/subjects');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground relative overflow-hidden">
      {/* Animated background elements for premium feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        {/* Page Header with Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-white">
              Study Analytics
            </h1>
            <p className="text-slate-400 mt-1">
              Performance insights and visualizations
            </p>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="rounded-full px-4 py-2 h-10 bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 text-white"
                >
                  Date: Now <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900/95 backdrop-blur-xl border-white/10">
                <DropdownMenuItem className="text-white hover:bg-white/10">Today</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10">This Week</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10">This Month</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="rounded-full px-4 py-2 h-10 bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 text-white"
                >
                  Subject: All <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900/95 backdrop-blur-xl border-white/10">
                <DropdownMenuItem className="text-white hover:bg-white/10">All Subjects</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10">Math</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10">Reading</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Layout Switcher */}
            <Button
              variant="outline"
              size="icon"
              onClick={onSwitchLayout}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 text-white"
              title="Switch to Classic Dashboard"
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quick Actions Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {/* Exam Countdown Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Exam Countdown</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {examInfo.daysUntilExam !== null ? `${examInfo.daysUntilExam} days` : 'No exam set'}
                  </p>
                  {examInfo.daysUntilExam !== null && (
                    <p className="text-xs text-primary mt-1">
                      {examInfo.daysUntilExam <= 7 ? 'Less than a week!' : 'Keep studying!'}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Streak Card */}
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Study Streak</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{studyStreak} days</p>
                  <p className="text-xs text-warning mt-1">
                    {studyStreak > 5 ? 'On fire! Keep it up!' : studyStreak > 0 ? 'Good job!' : 'Start today!'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Progress Card */}
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Today's Goals</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.completedGoals}/{stats.totalGoals}
                  </p>
                  <p className="text-xs text-success mt-1">
                    {stats.totalGoals > 0
                      ? `${Math.round((stats.completedGoals / stats.totalGoals) * 100)}% completed`
                      : 'No goals set'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Study Hours Card */}
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Total Study Hours</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalHours}h</p>
                  <p className="text-xs text-accent mt-1">
                    {stats.totalSessions} sessions completed
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Study Progress Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <StatCardWithChart
              title="Syllabus Progress"
              metrics={[
                { label: 'Completed', value: `${stats.syllabusProgress}%`, color: 'hsl(var(--success))' },
                { label: 'Chapters', value: `${stats.completedChapters}/${stats.totalChapters}`, color: 'hsl(var(--primary))' },
              ]}
              chartData={customerChartData}
            />
          </motion.div>

          {/* Subject Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <StatCardWithChart
              title="Subjects"
              metrics={[
                { label: 'Total Books', value: stats.totalBooks.toString(), color: 'hsl(var(--primary))' },
                { label: 'Active', value: stats.totalBooks > 0 ? (stats.totalBooks - 1).toString() : '0', color: 'hsl(var(--accent))' },
              ]}
              chartData={customerChartData}
            />
          </motion.div>

          {/* Projects Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <ProjectsTimeline projects={studyTimeline.length > 0 ? studyTimeline : [{ id: '1', name: 'Start Studying', startDate: format(new Date(), 'yyyy-MM-dd'), duration: 1, color: 'hsl(var(--primary))' }]} />
          </motion.div>
        </div>

        {/* Row 2: Today's Goals & Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Goals */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Today's Goals
                  </CardTitle>
                  <Badge variant="outline">{stats.completedGoals}/{stats.totalGoals}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {goalsArray.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No goals set for today</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={handleViewGoals}
                    >
                      Add goals <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goalsArray.slice(0, 5).map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                        onClick={() => toggleGoal(goal.id)}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                            goal.completed
                              ? 'border-success bg-success'
                              : 'border-muted-foreground group-hover:border-primary'
                          }`}
                        >
                          {goal.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <span
                          className={`text-sm flex-1 ${
                            goal.completed
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground'
                          }`}
                        >
                          {goal.task}
                        </span>
                      </div>
                    ))}
                    {goalsArray.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={handleViewGoals}
                      >
                        View all {goalsArray.length} goals
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start gap-3"
                  onClick={handleStartSession}
                >
                  <PlayCircle className="w-4 h-4" />
                  Start Study Session
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={handleViewGoals}
                >
                  <Target className="w-4 h-4" />
                  Manage Daily Goals
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={handleViewBooks}
                >
                  <BookOpen className="w-4 h-4" />
                  View Subjects & Books
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate('/track-my-progress')}
                >
                  <TrendingUp className="w-4 h-4" />
                  Track My Progress
                </Button>
              </CardContent>
            </Card>

            {/* Subject Progress */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Subject Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subjectProgress.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No books added yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={handleViewBooks}
                    >
                      Add books <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subjectProgress.map((subject) => (
                      <div key={subject.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{subject.name}</span>
                          <span className="text-xs text-muted-foreground">{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {subject.completed} of {subject.total} chapters
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Row 3: Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VerticalBarChart
              title="Weekly Productivity"
              data={weeklyData}
            />

            {/* Recent Sessions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Sessions
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/study-sessions')}
                  >
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentSessions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No study sessions yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={handleStartSession}
                    >
                      Start your first session <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {session.subject || 'Study Session'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(session.startTime), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{Math.round(session.duration / 60)}h {session.duration % 60}m</p>
                          <p className="text-xs text-muted-foreground">
                            Productivity: {session.productivity || '-'}/5
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Legend for Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-6 flex items-center justify-end gap-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Planned</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ModernDashboard;
