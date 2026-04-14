import { useMemo } from 'react';
import { format, subHours, subDays, startOfHour, startOfDay, startOfWeek, isSameHour, isSameDay, isSameWeek, isSameMonth } from 'date-fns';
import type { TrendDataPoint, TrendSeries, TimeRange, DataView } from '../components/StudyProgressTrends';
import type { MetricData } from '../components/ProgressMetrics';

interface SessionInput {
  startTime: string;
  duration: number;
  subject?: string;
  productivity?: number;
  sessionType?: string;
  completed?: boolean;
}

// Helper: get bucket start time for a given index
const getBucketStart = (timeRange: TimeRange, index: number, count: number, now: Date): Date => {
  const i = count - 1 - index; // reverse index (0 = oldest)
  switch (timeRange) {
    case 'hourly':
      return subHours(startOfHour(now), i);
    case 'daily':
      return subDays(startOfDay(now), i);
    case 'weekly':
      return subDays(startOfDay(now), i * 7);
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() - i, 1);
  }
};

// Helper: check if session falls within a bucket
const isInBucket = (sessionDate: Date, bucketStart: Date, timeRange: TimeRange): boolean => {
  switch (timeRange) {
    case 'hourly':
      return isSameHour(sessionDate, bucketStart);
    case 'daily':
      return isSameDay(sessionDate, bucketStart);
    case 'weekly':
      return isSameWeek(sessionDate, bucketStart);
    case 'monthly':
      return isSameMonth(sessionDate, bucketStart);
  }
};

// Helper: bucket sessions into time periods (O(n) instead of O(n*m))
const bucketSessions = (
  sessions: SessionInput[],
  timeRange: TimeRange,
  count: number,
  now: Date
): Map<number, SessionInput[]> => {
  const buckets = new Map<number, SessionInput[]>();

  // Initialize empty buckets
  for (let i = 0; i < count; i++) {
    buckets.set(i, []);
  }

  // Pre-calculate bucket boundaries
  const bucketStarts = Array.from({ length: count }, (_, i) =>
    getBucketStart(timeRange, i, count, now)
  );

  // Single pass through sessions
  sessions.forEach(session => {
    const sessionDate = new Date(session.startTime);

    // Find matching bucket using binary search for efficiency
    let left = 0;
    let right = count - 1;
    let matchIndex = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (isInBucket(sessionDate, bucketStarts[mid], timeRange)) {
        matchIndex = mid;
        break;
      }

      // Determine search direction based on time comparison
      const bucketTime = bucketStarts[mid].getTime();
      const sessionTime = sessionDate.getTime();

      if (sessionTime < bucketTime) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    if (matchIndex !== -1) {
      buckets.get(matchIndex)?.push(session);
    }
  });

  return buckets;
};

// Generate trend data from real sessions
export const useTrendData = (
  timeRange: TimeRange,
  dataView: DataView,
  sessions: SessionInput[]
): { data: TrendDataPoint[]; series: TrendSeries[] } => {
  return useMemo(() => {
    const now = new Date();
    const count = timeRange === 'hourly' ? 24 : timeRange === 'daily' ? 14 : timeRange === 'weekly' ? 12 : 6;

    // Get unique subjects from real sessions
    const subjects = [...new Set(sessions.map(s => s.subject).filter(Boolean))] as string[];

    // If no sessions yet, return empty chart
    if (subjects.length === 0) {
      return { data: [], series: [] };
    }

    const activeSubjects = subjects.slice(0, 5);

    // Bucket sessions by time period
    const buckets = bucketSessions(sessions, timeRange, count, now);

    // Build data points
    const points: TrendDataPoint[] = [];

    for (let i = count - 1; i >= 0; i--) {
      let timestamp: Date;
      let label: string;

      switch (timeRange) {
        case 'hourly':
          timestamp = subHours(startOfHour(now), i);
          label = format(timestamp, 'HH:mm');
          break;
        case 'daily':
          timestamp = subDays(startOfDay(now), i);
          label = format(timestamp, 'MMM d');
          break;
        case 'weekly':
          timestamp = subDays(startOfDay(now), i * 7);
          label = `Week ${format(timestamp, 'w')}`;
          break;
        case 'monthly':
          timestamp = new Date(now.getFullYear(), now.getMonth() - i, 1);
          label = format(timestamp, 'MMM yyyy');
          break;
      }

      const bucketIndex = count - 1 - i;
      const bucketSess = buckets.get(bucketIndex) || [];

      const point: TrendDataPoint = {
        timestamp: timestamp!.toISOString(),
        label: label!,
      };

      // Calculate real values per subject
      activeSubjects.forEach(subject => {
        const subjectSessions = bucketSess.filter(s => s.subject === subject);

        switch (dataView) {
          case 'success_rate': {
            const total = subjectSessions.length;
            const completed = subjectSessions.filter(s => s.completed).length;
            point[subject] = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;
            break;
          }
          case 'study_hours': {
            const totalMinutes = subjectSessions.reduce((sum, s) => sum + s.duration, 0);
            point[subject] = Math.round((totalMinutes / 60) * 10) / 10;
            break;
          }
          case 'goals': {
            // Use productivity as a proxy for goal achievement (scaled 0-100)
            const avgProd = subjectSessions.length > 0
              ? subjectSessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / subjectSessions.length
              : 0;
            point[subject] = Math.round(avgProd * 20); // productivity is 0-5, scale to 0-100
            break;
          }
          case 'errors': {
            // Low productivity sessions (productivity <= 2)
            const lowProd = subjectSessions.filter(s => (s.productivity || 0) <= 2).length;
            const total = subjectSessions.length;
            point[subject] = total > 0 ? Math.round((lowProd / total) * 1000) / 10 : 0;
            break;
          }
        }
      });

      // Calculate overall average across subjects
      const values = activeSubjects.map(s => Number(point[s]) || 0);
      point['overall'] = values.length > 0
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
        : 0;

      points.push(point);
    }

    // Series configuration
    const colors = ['#696FC7', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
    const seriesConfig: TrendSeries[] = activeSubjects.map((subject, idx) => ({
      id: subject.toLowerCase().replace(/\s+/g, '_'),
      name: subject,
      color: colors[idx % colors.length],
      dataKey: subject,
      visible: true,
    }));

    return { data: points, series: seriesConfig };
  }, [timeRange, dataView, sessions]);
};

// Generate metrics from real session, goal, and book data
export const useProgressMetrics = (
  sessions: SessionInput[],
  goals: Array<{ completed: boolean }>,
  books: Array<{ completedChapters?: number; totalChapters?: number }>
): MetricData[] => {
  return useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toDateString();
    });

    // Daily study hours from real sessions
    const dailyHours = last7Days.map(day => {
      return sessions
        .filter(s => new Date(s.startTime).toDateString() === day)
        .reduce((sum, s) => sum + s.duration / 60, 0);
    });

    // Daily session counts
    const dailySessionCounts = last7Days.map(day => {
      return sessions.filter(s => new Date(s.startTime).toDateString() === day).length;
    });

    // Daily completed session counts
    const dailyCompletedCounts = last7Days.map(day => {
      return sessions.filter(s =>
        new Date(s.startTime).toDateString() === day && s.completed
      ).length;
    });

    // Daily completed goals count (assuming goals array is for today only,
    // we use completed sessions as a proxy for historical goal completion)
    const dailyGoalCompletions = last7Days.map(day => {
      const dayStr = new Date(day).toDateString();
      const todayStr = new Date().toDateString();
      if (dayStr === todayStr) {
        return goals.filter(g => g.completed).length;
      }
      // For historical days, use completed sessions as proxy
      return sessions.filter(s =>
        new Date(s.startTime).toDateString() === day && s.completed
      ).length;
    });

    // Daily productivity averages
    const dailyProductivity = last7Days.map(day => {
      const daySessions = sessions.filter(
        s => new Date(s.startTime).toDateString() === day
      );
      if (daySessions.length === 0) return 0;
      const avg = daySessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / daySessions.length;
      return avg * 20; // Scale 0-5 to 0-100
    });

    // Goals completion
    const completedGoals = goals.filter(g => g.completed).length;
    const totalGoals = goals.length;

    // Syllabus progress
    const totalChapters = books.reduce((sum, b) => sum + (b.totalChapters || 0), 0);
    const completedChapters = books.reduce((sum, b) => sum + (b.completedChapters || 0), 0);
    const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    // Total hours
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = totalMinutes / 60;

    // Avg session length
    const avgSessionMinutes = sessions.length > 0 ? totalMinutes / sessions.length : 0;
    const avgSessionHours = avgSessionMinutes / 60;

    // High productivity sessions (productivity >= 3)
    const highProdSessions = sessions.filter(s => (s.productivity || 0) >= 3).length;

    // Daily high-prod counts for sparkline
    const dailyHighProd = last7Days.map(day => {
      return sessions.filter(s =>
        new Date(s.startTime).toDateString() === day && (s.productivity || 0) >= 3
      ).length;
    });

    // Incomplete rate
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.completed).length;
    const incompleteRate = totalSessions > 0 ? ((totalSessions - completedSessions) / totalSessions) * 100 : 0;

    // Daily incomplete rates for sparkline
    const dailyIncompleteRate = last7Days.map(day => {
      const daySessions = sessions.filter(s => new Date(s.startTime).toDateString() === day);
      const dayCompleted = daySessions.filter(s => s.completed).length;
      return daySessions.length > 0 ? ((daySessions.length - dayCompleted) / daySessions.length) * 100 : 0;
    });

    // Overall productivity rate
    const overallProductivity = sessions.length > 0
      ? (sessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / sessions.length) * 20
      : 0;

    // Calculate week-over-week change (this week vs last week)
    const calculateChange = (data: number[]) => {
      if (data.length < 7) return 0;
      // For 7-day data: compare days 0-2 (last week partial) vs days 3-6 (this week partial)
      // Or better: days 0-3 vs days 4-7 if we have 8 days
      const midPoint = Math.floor(data.length / 2);
      const lastWeek = data.slice(0, midPoint);
      const thisWeek = data.slice(midPoint);
      const lastWeekTotal = lastWeek.reduce((a, b) => a + b, 0);
      const thisWeekTotal = thisWeek.reduce((a, b) => a + b, 0);
      return lastWeekTotal > 0
        ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
        : (thisWeekTotal > 0 ? 100 : 0);
    };

    return [
      {
        label: 'Syllabus Progress',
        value: progress.toFixed(1),
        suffix: '%',
        change: calculateChange(dailyCompletedCounts),
        data: dailyCompletedCounts.length > 0 && dailyCompletedCounts.some(v => v > 0)
          ? dailyCompletedCounts
          : [0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: 'Productive Sessions',
        value: highProdSessions,
        change: calculateChange(dailyHighProd),
        data: dailyHighProd.length > 0 && dailyHighProd.some(v => v > 0)
          ? dailyHighProd
          : [0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: 'Goals Completed',
        value: `${completedGoals}/${totalGoals}`,
        change: calculateChange(dailyGoalCompletions),
        data: dailyGoalCompletions.length > 0 && dailyGoalCompletions.some(v => v > 0)
          ? dailyGoalCompletions
          : [0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: 'Study Hours',
        value: totalHours.toFixed(1),
        suffix: 'h',
        change: calculateChange(dailyHours),
        data: dailyHours.length > 0 && dailyHours.some(v => v > 0)
          ? dailyHours
          : [0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: 'Avg Session Length',
        value: avgSessionHours.toFixed(2),
        suffix: 'h',
        change: calculateChange(dailyProductivity),
        data: dailyProductivity.length > 0 && dailyProductivity.some(v => v > 0)
          ? dailyProductivity
          : [0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: 'Incomplete Rate',
        value: incompleteRate.toFixed(1),
        suffix: '%',
        change: calculateChange(dailyIncompleteRate),
        data: dailyIncompleteRate.length > 0 && dailyIncompleteRate.some(v => v > 0)
          ? dailyIncompleteRate
          : [0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: 'Total Sessions',
        value: totalSessions,
        change: calculateChange(dailySessionCounts),
        data: dailySessionCounts.length > 0 && dailySessionCounts.some(v => v > 0)
          ? dailySessionCounts
          : [0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: 'Productivity Score',
        value: overallProductivity.toFixed(1),
        suffix: '%',
        change: calculateChange(dailyProductivity),
        data: dailyProductivity.length > 0 && dailyProductivity.some(v => v > 0)
          ? dailyProductivity
          : [0, 0, 0, 0, 0, 0, 0],
      },
    ];
  }, [sessions, goals, books]);
};

// Hook for revision session insights (uses real revision-type sessions)
export const useRevisionMetrics = (sessions: SessionInput[]): MetricData[] => {
  return useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toDateString();
    });

    // Count revision sessions per day from real data
    const dailyRevisionCounts = last7Days.map(day => {
      return sessions.filter(s =>
        new Date(s.startTime).toDateString() === day && s.sessionType === 'Revision'
      ).length;
    });

    // Calculate revision hours per day
    const dailyRevisionHours = last7Days.map(day => {
      return sessions
        .filter(s => new Date(s.startTime).toDateString() === day && s.sessionType === 'Revision')
        .reduce((sum, s) => sum + s.duration / 60, 0);
    });

    const totalRevisionSessions = sessions.filter(s => s.sessionType === 'Revision').length;
    const totalRevisionHours = sessions
      .filter(s => s.sessionType === 'Revision')
      .reduce((sum, s) => sum + s.duration / 60, 0);

    const calculateChange = (data: number[]) => {
      if (data.length < 2) return 0;
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));
      const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
      const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
      return firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0;
    };

    return [
      {
        label: 'Revision Sessions',
        value: totalRevisionSessions,
        change: calculateChange(dailyRevisionCounts),
        data: dailyRevisionCounts.some(v => v > 0)
          ? dailyRevisionCounts
          : [0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: 'Revision Hours',
        value: totalRevisionHours.toFixed(1),
        suffix: 'h',
        change: calculateChange(dailyRevisionHours),
        data: dailyRevisionHours.some(v => v > 0)
          ? dailyRevisionHours
          : [0, 0, 0, 0, 0, 0, 0],
      },
    ];
  }, [sessions]);
};
