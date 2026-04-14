import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Clock,
  BookOpen,
  TrendingUp,
  Play,
  Pause,
  Square,
  Star,
  Award,
  Activity,
  Focus
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchStudySessions,
  createStudySession,
  deleteStudySession,
  fetchStudyAnalytics,
  clearError
} from '@/redux/slices/studySessionSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CreateStudySessionRequest } from '@/api/studySessionApi';
import SessionCard from '@/components/StudySessions/SessionCard';
import SessionFilters, { FilterOptions } from '@/components/StudySessions/SessionFilters';
import StatCard from '@/components/StatCard';

interface StudySession {
  _id: string;
  subject: string;
  topic?: string;
  startTime: string;
  endTime: string;
  duration: number;
  sessionType: string;
  productivity: number;
  mood: string;
  notes?: string;
  breaksTaken: number;
  isActive?: boolean;
  focusTime?: number;
  createdAt: string;
}

const StudySessions: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sessions, analytics, isLoading, error } = useAppSelector((state) => state.studySessions);
  const { toast } = useToast();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [analyticsFilter, setAnalyticsFilter] = useState<'7d' | '30d' | '90d'>('7d');
  const [currentTimer, setCurrentTimer] = useState<{
    isRunning: boolean;
    startTime: Date | null;
    duration: number;
    sessionId?: string;
  }>({
    isRunning: false,
    startTime: null,
    duration: 0
  });

  // Pomodoro & Timer State
  const [timerMode, setTimerMode] = useState<'STOPWATCH' | 'POMODORO'>('STOPWATCH');
  const [pomodoroMode, setPomodoroMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sessionTypes: [],
    subjects: [],
    moods: [],
    productivityRange: [1, 5],
    dateRange: {},
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [formData, setFormData] = useState<CreateStudySessionRequest>({
    subject: '',
    topic: '',
    startTime: '',
    endTime: '',
    sessionType: 'Reading',
    productivity: 3,
    notes: '',
    breaksTaken: 0,
    mood: 'Good'
  });

  // Pomodoro & Timer State

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentTimer.isRunning) {
      interval = setInterval(() => {
        if (timerMode === 'STOPWATCH') {
          // Count up
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - currentTimer.startTime!.getTime()) / 1000);
          setCurrentTimer(prev => ({ ...prev, duration: elapsed }));
        } else {
          // Count down (Pomodoro)
          setTimeLeft(prev => {
            if (prev <= 1) {
              // Timer finished
              handlePomodoroComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTimer.isRunning, currentTimer.startTime, timerMode]);

  const handlePomodoroComplete = async () => {
    setCurrentTimer(prev => ({ ...prev, isRunning: false }));

    if (pomodoroMode === 'FOCUS') {
      // Auto-log focus session
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 25 * 60 * 1000); // Assume full 25m

      // Auto-create session
      const sessionData = {
        subject: 'Pomodoro Session',
        topic: 'Focus Block',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: 25,
        sessionType: 'Reading',
        productivity: 4,
        notes: 'Completed Pomodoro session',
        breaksTaken: 0,
        mood: 'Good'
      } as any; // Cast for now to bypass strict typing of create request

      const result = await dispatch(createStudySession(sessionData)).unwrap();
      toast({ title: "Focus Session Complete!", description: "Great job! Take a short break." });

      // Handle new achievements
      if (result.newAchievements && result.newAchievements.length > 0) {
        result.newAchievements.forEach((achievement: any) => {
          toast({
            title: `🏆 ${achievement.rarity.toUpperCase()} ACHIEVEMENT!`,
            description: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
          });
        });
      }

      // Switch to break
      setPomodoroMode('BREAK');
      setTimeLeft(5 * 60);
    } else {
      toast({ title: "Break Over!", description: "Ready to focus again?" });
      setPomodoroMode('FOCUS');
      setTimeLeft(25 * 60);
    }
  };

  useEffect(() => {
    dispatch(fetchStudySessions({}));
    dispatch(fetchStudyAnalytics(analyticsFilter));
  }, [dispatch, analyticsFilter]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  // Memoized filtered and sorted sessions
  const filteredSessions = useMemo(() => {
    let filtered = [...(sessions || [])];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(session =>
        session.subject.toLowerCase().includes(searchTerm) ||
        session.topic?.toLowerCase().includes(searchTerm) ||
        session.notes?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply session type filter
    if (filters.sessionTypes.length > 0) {
      filtered = filtered.filter(session =>
        filters.sessionTypes.includes(session.sessionType)
      );
    }

    // Apply subject filter
    if (filters.subjects.length > 0) {
      filtered = filtered.filter(session =>
        filters.subjects.includes(session.subject)
      );
    }

    // Apply mood filter
    if (filters.moods.length > 0) {
      filtered = filtered.filter(session =>
        filters.moods.includes(session.mood)
      );
    }

    // Apply productivity range filter
    filtered = filtered.filter(session =>
      session.productivity >= filters.productivityRange[0] &&
      session.productivity <= filters.productivityRange[1]
    );

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.startTime);
        if (filters.dateRange.from && sessionDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && sessionDate > filters.dateRange.to) return false;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'productivity':
          aValue = a.productivity;
          bValue = b.productivity;
          break;
        case 'subject':
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [sessions, filters]);

  // Get unique subjects for filtering
  const availableSubjects = useMemo(() => {
    return [...new Set((sessions || []).map(session => session.subject))];
  }, [sessions]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setCurrentTimer({
      isRunning: true,
      startTime: new Date(),
      duration: 0
    });
  };

  const pauseTimer = () => {
    setCurrentTimer(prev => ({
      ...prev,
      isRunning: false
    }));
  };

  const stopTimer = () => {
    if (currentTimer.duration > 0) {
      // Automatically create session from timer
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - currentTimer.duration * 1000);

      setFormData({
        ...formData,
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16)
      });
      setShowCreateDialog(true);
    }

    setCurrentTimer({
      isRunning: false,
      startTime: null,
      duration: 0
    });
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.subject || !formData.startTime || !formData.endTime) {
        toast({
          title: 'Missing Required Fields',
          description: 'Please fill in all required fields (Subject, Start Time, End Time)',
          variant: 'destructive',
        });
        return;
      }

      // Calculate duration in minutes
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      const durationInMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

      if (durationInMinutes <= 0) {
        toast({
          title: 'Invalid Duration',
          description: 'End time must be after start time',
          variant: 'destructive',
        });
        return;
      }

      const sessionData = {
        subject: formData.subject,
        topic: formData.topic || '',
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: durationInMinutes,
        sessionType: formData.sessionType,
        productivity: formData.productivity,
        notes: formData.notes || '',
        breaksTaken: formData.breaksTaken,
        mood: formData.mood
      };

      console.log('Sending session data:', sessionData);

      const result = await dispatch(createStudySession(sessionData)).unwrap();
      setShowCreateDialog(false);
      setFormData({
        subject: '',
        topic: '',
        startTime: '',
        endTime: '',
        sessionType: 'Reading',
        productivity: 3,
        notes: '',
        breaksTaken: 0,
        mood: 'Good'
      });
      setEditingSession(null);
      toast({
        title: 'Success',
        description: 'Study session created successfully',
      });

      // Handle new achievements
      if (result.newAchievements && result.newAchievements.length > 0) {
        result.newAchievements.forEach((achievement: any) => {
          setTimeout(() => {
            toast({
              title: `🏆 ${achievement.rarity.toUpperCase()} ACHIEVEMENT!`,
              description: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
            });
          }, 500); // Slight delay for better UX
        });
      }
      dispatch(fetchStudyAnalytics(analyticsFilter));
    } catch (error) {
      console.error('Failed to create session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create study session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session);
    setFormData({
      subject: session.subject,
      topic: session.topic || '',
      startTime: new Date(session.startTime).toISOString().slice(0, 16),
      endTime: new Date(session.endTime).toISOString().slice(0, 16),
      sessionType: session.sessionType as 'Reading' | 'Practice' | 'Revision' | 'Test' | 'Notes',
      productivity: session.productivity,
      notes: session.notes || '',
      breaksTaken: session.breaksTaken,
      mood: session.mood as 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor'
    });
    setShowCreateDialog(true);
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await dispatch(deleteStudySession(id)).unwrap();
      toast({
        title: 'Success',
        description: 'Study session deleted successfully',
      });
      dispatch(fetchStudyAnalytics(analyticsFilter));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleResumeSession = (session: StudySession) => {
    // Logic to resume a session (could start timer with session context)
    setCurrentTimer({
      isRunning: true,
      startTime: new Date(),
      duration: 0,
      sessionId: session._id
    });
    toast({
      title: 'Session Resumed',
      description: `Continuing ${session.subject} session`,
    });
  };

  // Calculate enhanced analytics
  const enhancedAnalytics = useMemo(() => {
    if (!analytics || !sessions) return null;

    const averageSessionLength = sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length)
      : 0;

    // Calculate study streak - consecutive days with at least one session using local date strings
    const studyDateStrings = [...new Set(sessions.map(session => {
      // Normalize to local date string to avoid UTC midnight shifts
      const d = new Date(session.startTime);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }))];
    
    // Sort chronologically
    const studyDates = studyDateStrings.map(ds => {
      const [y, m, d] = ds.split('-').map(Number);
      return new Date(y, m - 1, d); // Midnight local time
    }).sort((a, b) => a.getTime() - b.getTime());

    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate: Date | null = null;

    for (const dateStr of studyDates) {
      const currentDate = new Date(dateStr);

      if (lastDate === null) {
        currentStreak = 1;
      } else {
        // Use Math.round to safely calculate day boundaries avoiding 23h DST gaps
        const daysDiff = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          // Consecutive day
          currentStreak++;
        } else if (daysDiff > 1) {
          // Gap in streak, reset
          currentStreak = 1;
        }
      }

      maxStreak = Math.max(maxStreak, currentStreak);
      lastDate = currentDate;
    }

    // Check if streak continues to today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Default 0 if no streak
    let activeStreak = 0;
    
    if (studyDates.length > 0) {
      const lastStudyDate = studyDates[studyDates.length - 1];
      const daysSinceLastStudy = Math.round((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));
  
      // Active streak if last study was today or yesterday
      activeStreak = daysSinceLastStudy <= 1 ? currentStreak : 0;
    }

    // Safety fallback for totalHours and averageProductivity if backend doesn't provide it
    const fallbackTotalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    
    // Fallback for average productivity
    const validProdSessions = sessions.filter(s => typeof s.productivity === 'number' && s.productivity > 0);
    const fallbackAvgProd = validProdSessions.length > 0 
      ? Math.round((validProdSessions.reduce((sum, s) => sum + s.productivity, 0) / validProdSessions.length) * 10) / 10 
      : 0;

    return {
      ...analytics, // Keep backend properties
      totalSessions: sessions.length, // Guarantee truthful local sync
      totalHours: analytics?.totalHours && analytics.totalHours > 0 ? analytics.totalHours : Math.round(fallbackTotalHours * 10) / 10,
      averageProductivity: analytics?.averageProductivity && analytics.averageProductivity > 0 ? analytics.averageProductivity : fallbackAvgProd,
      averageSessionLength,
      streakDays: activeStreak
    };
  }, [analytics, sessions]);

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Study <span className="text-primary">Sessions</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Track, analyze, and optimize your learning journey
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    New Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                  <DialogHeader className="mb-2">
                    <DialogTitle className="text-xl font-bold">
                      {editingSession ? 'Edit Study Session' : 'Log Study Session'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Fill out the form below to log a new study session or edit an existing one.
                    </DialogDescription>
                  </DialogHeader>

                  {!editingSession && sessions && sessions.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Quick Renew</Label>
                      <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar scroll-smooth">
                        {Array.from(new Set(sessions.map(s => s.subject))).slice(0, 5).map(subject => {
                          const recentSession = sessions.find(s => s.subject === subject);
                          if (!recentSession) return null;
                          return (
                            <button
                              key={subject}
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                subject: recentSession.subject, 
                                topic: recentSession.topic || '', 
                                sessionType: recentSession.sessionType,
                                productivity: 3,
                                mood: 'Good',
                                breaksTaken: 0,
                                notes: ''
                              }))}
                              className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-muted/30 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors text-xs font-medium"
                            >
                              <BookOpen className="w-3 h-3" />
                              {subject}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleCreateSession} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="subject" className="font-semibold text-foreground">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          placeholder="e.g., Mathematics"
                          className="bg-background/50 focus:bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sessionType" className="font-semibold text-foreground">Type</Label>
                        <Select
                          value={formData.sessionType}
                          onValueChange={(value) => setFormData({ ...formData, sessionType: value as 'Reading' | 'Practice' | 'Revision' | 'Test' | 'Notes' })}
                        >
                          <SelectTrigger className="bg-background/50 focus:bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Reading">📖 Reading</SelectItem>
                            <SelectItem value="Practice">🎯 Practice</SelectItem>
                            <SelectItem value="Revision">📚 Revision</SelectItem>
                            <SelectItem value="Test">✅ Test</SelectItem>
                            <SelectItem value="Notes">📝 Notes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="startTime" className="font-semibold text-foreground">Start Time *</Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          required
                          className="bg-background/50 focus:bg-background h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="endTime" className="font-semibold text-foreground">End Time *</Label>
                        <Input
                          id="endTime"
                          type="datetime-local"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          required
                          className="bg-background/50 focus:bg-background h-10"
                        />
                      </div>
                    </div>

                    {/* Advanced Options Toggle */}
                    <details className="group border border-border/50 rounded-lg bg-muted/10 open:bg-muted/30 transition-colors">
                      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-muted-foreground group-open:text-foreground flex items-center gap-2 select-none hover:bg-muted/20">
                        <div className="flex-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-open:bg-primary transition-colors"></span>
                          Advanced Options
                        </div>
                        <span className="text-xs font-normal opacity-50 group-open:opacity-100 transition-opacity">
                          (Topic, Mood, Focus, Notes)
                        </span>
                      </summary>
                      
                      <div className="p-4 pt-1 space-y-4 border-t border-border/50 mt-1">
                        <div className="space-y-1.5 mt-2">
                          <Label htmlFor="topic" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specific Topic</Label>
                          <Input
                            id="topic"
                            value={formData.topic}
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            placeholder="e.g., Calculus Integration"
                            className="bg-background/50 h-9"
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           <div className="space-y-1.5">
                            <Label htmlFor="mood" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mood</Label>
                            <Select
                              value={formData.mood}
                              onValueChange={(value) => setFormData({ ...formData, mood: value as 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor' })}
                            >
                              <SelectTrigger className="bg-background/50 h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Excellent">😊 Excel</SelectItem>
                                <SelectItem value="Good">🙂 Good</SelectItem>
                                <SelectItem value="Average">😐 Avg</SelectItem>
                                <SelectItem value="Poor">😞 Poor</SelectItem>
                                <SelectItem value="Very Poor">😓 V.Poor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="productivity" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focus (1-5)</Label>
                            <Select
                              value={formData.productivity.toString()}
                              onValueChange={(value) => setFormData({ ...formData, productivity: parseInt(value) })}
                            >
                              <SelectTrigger className="bg-background/50 h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">⭐ 1</SelectItem>
                                <SelectItem value="2">⭐⭐ 2</SelectItem>
                                <SelectItem value="3">⭐⭐⭐ 3</SelectItem>
                                <SelectItem value="4">⭐⭐⭐⭐ 4</SelectItem>
                                <SelectItem value="5">⭐⭐⭐⭐⭐ 5</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="breaksTaken" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Breaks</Label>
                            <Input
                              id="breaksTaken"
                              type="number"
                              min="0"
                              value={formData.breaksTaken}
                              onChange={(e) => setFormData({ ...formData, breaksTaken: parseInt(e.target.value) || 0 })}
                              className="bg-background/50 h-9"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes / Learnings</Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            placeholder="Quick reflection on the session..."
                            className="bg-background/50 resize-y"
                          />
                        </div>
                      </div>
                    </details>

                    <div className="flex gap-3 pt-4 border-t border-border/50 mt-4 pb-2">
                      <Button type="submit" className="flex-1 shadow-md" disabled={isLoading}>
                        {editingSession ? 'Save Changes' : 'Log Session'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setShowCreateDialog(false);
                          setEditingSession(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {enhancedAnalytics && (
          <div className="analytics-section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Analytics Overview</h2>
              <Select value={analyticsFilter} onValueChange={(value) => setAnalyticsFilter(value as '7d' | '30d' | '90d')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Sessions"
                value={enhancedAnalytics.totalSessions.toString()}
                icon={BookOpen}
                color="primary"
              />
              <StatCard
                title="Study Hours"
                value={`${enhancedAnalytics.totalHours}h`}
                icon={Clock}
                color="success"
              />
              <StatCard
                title="Avg Productivity"
                value={`${enhancedAnalytics.averageProductivity}/5`}
                icon={TrendingUp}
                color="accent"
              />
              <StatCard
                title="Study Streak"
                value={`${enhancedAnalytics.streakDays} days`}
                icon={Activity}
                color="accent"
              />
            </div>
          </div>
        )}

        <div className="filters-section">
          <SessionFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableSubjects={availableSubjects}
            totalSessions={sessions?.length || 0}
            filteredSessions={filteredSessions.length}
          />
        </div>

        <div className="sessions-grid">
          {filteredSessions.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {filters.search || filters.sessionTypes.length > 0 || filters.subjects.length > 0
                      ? 'No sessions match your filters'
                      : 'No study sessions yet'
                    }
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {filters.search || filters.sessionTypes.length > 0 || filters.subjects.length > 0
                      ? 'Try adjusting your search criteria or filters to find sessions.'
                      : 'Start your learning journey by creating your first study session!'
                    }
                  </p>
                  <div className="flex gap-3 justify-center">
                    {(filters.search || filters.sessionTypes.length > 0 || filters.subjects.length > 0) && (
                      <Button
                        variant="outline"
                        onClick={() => setFilters({
                          search: '',
                          sessionTypes: [],
                          subjects: [],
                          moods: [],
                          productivityRange: [1, 5],
                          dateRange: {},
                          sortBy: 'date',
                          sortOrder: 'desc'
                        })}
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Session
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredSessions.map((session, index) => (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                  >
                    <SessionCard
                      session={session}
                      onEdit={handleEditSession}
                      onDelete={handleDeleteSession}
                      onResume={handleResumeSession}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {filteredSessions.length > 0 && filteredSessions.length < (sessions?.length || 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Button variant="outline" size="lg">
              Load More Sessions
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudySessions;
