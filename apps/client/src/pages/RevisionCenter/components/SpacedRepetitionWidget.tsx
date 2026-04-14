import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  TrendingUp,
  RotateCcw,
  Brain,
  Target,
  Sparkles,
  BookOpen,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Book } from '@/redux/slices/bookSlice';
import {
  isDueForRevision,
  getDaysUntilRevision,
  getRevisionStatusText,
  groupByUrgency,
  sortByRevisionPriority,
  SPACED_REPETITION_INTERVALS
} from '@/lib/spacedRepetition';

interface SpacedRepetitionWidgetProps {
  books: Book[];
  onReviewChapter?: (bookId: string, chapterIndex: number) => void;
  onStartStudySession?: () => void;
}

interface ChapterWithBook {
  bookId: string;
  bookTitle: string;
  subject: string;
  chapterIndex: number;
  chapterName: string;
  nextRevisionDate?: string;
  revisionStage: number;
}

export function SpacedRepetitionWidget({
  books,
  onReviewChapter,
  onStartStudySession
}: SpacedRepetitionWidgetProps) {
  // Collect all chapters with spaced repetition data
  const chaptersDueForReview = useMemo(() => {
    const chapters: ChapterWithBook[] = [];

    books.forEach(book => {
      book.chapters?.forEach((chapter, index) => {
        if (chapter.nextRevisionDate || chapter.status === 'needs_revision') {
          chapters.push({
            bookId: book.id,
            bookTitle: book.title,
            subject: book.subject,
            chapterIndex: index,
            chapterName: chapter.name,
            nextRevisionDate: chapter.nextRevisionDate,
            revisionStage: chapter.revisionStage || 0
          });
        }
      });
    });

    return sortByRevisionPriority(chapters);
  }, [books]);

  // Group by urgency
  const grouped = useMemo(() => groupByUrgency(chaptersDueForReview), [chaptersDueForReview]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = chaptersDueForReview.length;
    const overdue = grouped.overdue.length;
    const dueToday = grouped.dueToday.length;
    const dueThisWeek = grouped.dueThisWeek.length;
    const mastered = chaptersDueForReview.filter(c => (c.revisionStage || 0) >= 5).length;
    const inProgress = total - mastered;

    // Calculate mastery percentage
    const masteryPercentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return {
      total,
      overdue,
      dueToday,
      dueThisWeek,
      mastered,
      inProgress,
      masteryPercentage,
      needsAttention: overdue + dueToday
    };
  }, [chaptersDueForReview, grouped]);

  const getUrgencyStyles = (daysUntil: number) => {
    if (daysUntil < 0) return {
      badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
      bg: 'hover:bg-red-50/50 dark:hover:bg-red-950/30'
    };
    if (daysUntil === 0) return {
      badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
      bg: 'hover:bg-orange-50/50 dark:hover:bg-orange-950/30'
    };
    if (daysUntil <= 3) return {
      badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      bg: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
    };
    return {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
      bg: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
    };
  };

  const renderStageDots = (stage: number) => {
    return (
      <div className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i < stage
                ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderChapterItem = (chapter: ChapterWithBook, index: number) => {
    const daysUntil = getDaysUntilRevision(chapter.nextRevisionDate);
    const styles = getUrgencyStyles(daysUntil);

    return (
      <motion.div
        key={`${chapter.bookId}-${chapter.chapterIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`group flex items-center gap-3 p-3 rounded-xl border border-border/50 ${styles.bg} transition-all cursor-pointer bg-card hover:border-border`}
        onClick={() => onReviewChapter?.(chapter.bookId, chapter.chapterIndex)}
      >
        {/* Stage indicator */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950 dark:to-purple-900 flex flex-col items-center justify-center gap-1">
          {renderStageDots(chapter.revisionStage || 0)}
          <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-300">
            {Math.min((chapter.revisionStage || 0), 5)}/5
          </span>
        </div>

        {/* Chapter info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">
            {chapter.chapterName}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{chapter.bookTitle}</span>
            <span className="text-border">•</span>
            <span className="truncate">{chapter.subject}</span>
          </div>
        </div>

        {/* Status badge */}
        <Badge
          variant="outline"
          className={`flex-shrink-0 text-xs font-medium ${styles.badge}`}
        >
          {getRevisionStatusText(daysUntil)}
        </Badge>

        {/* Review button */}
        <Button
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-all bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-500"
          onClick={(e) => {
            e.stopPropagation();
            onReviewChapter?.(chapter.bookId, chapter.chapterIndex);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Review
        </Button>
      </motion.div>
    );
  };

  const hasChapters = chaptersDueForReview.length > 0;
  const needsAttention = stats.needsAttention > 0;

  // Empty state
  if (!hasChapters) {
    return (
      <Card className="border border-border overflow-hidden bg-gradient-to-br from-card to-muted/30">
        <CardContent className="p-8">
          <div className="text-center max-w-md mx-auto">
            {/* Animated Brain Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative w-28 h-28 mx-auto mb-6"
            >
              {/* Pulsing rings */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-violet-400/30 dark:bg-violet-600/30 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="absolute inset-0 bg-violet-400/20 dark:bg-violet-600/20 rounded-full"
              />

              {/* Main icon container */}
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-500/30"
              >
                <Brain className="h-12 w-12 text-white" />
              </motion.div>

              {/* Floating sparkles */}
              <motion.div
                animate={{ y: [0, -5, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Sparkles className="h-4 w-4 text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-1 -left-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center shadow-md"
              >
                <Zap className="h-3 w-3 text-white" />
              </motion.div>
            </motion.div>

            {/* Title with typing effect */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground mb-3"
            >
              Smart Revision Schedule
            </motion.h3>

            {/* Animated description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2 mb-6"
            >
              <p className="text-muted-foreground leading-relaxed">
                Unlock the power of spaced repetition to remember
                <span className="font-semibold text-violet-600 dark:text-violet-400"> 90% more </span>
                of what you learn.
              </p>

              {/* Rotating tips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70 bg-muted/50 rounded-full px-4 py-2 mx-auto w-fit"
              >
                <motion.span
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.9, 1] }}
                >
                  🧠 Based on the forgetting curve
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Animated Interval Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative mb-6"
            >
              {/* Connection line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-200 via-purple-200 to-violet-200 dark:from-violet-900 dark:via-purple-900 dark:to-violet-900 -translate-y-1/2 mx-8" />

              <div className="grid grid-cols-3 gap-3 relative">
                {SPACED_REPETITION_INTERVALS.slice(0, 3).map((days, i) => (
                  <motion.div
                    key={days}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.6 + i * 0.15,
                      type: "spring",
                      stiffness: 300,
                      damping: 15
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="relative"
                  >
                    <div className="p-4 rounded-xl bg-card border border-border text-center relative overflow-hidden group cursor-default">
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/10 group-hover:to-purple-500/10 transition-all duration-300" />

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
                        className="text-2xl font-bold bg-gradient-to-br from-violet-600 to-purple-600 bg-clip-text text-transparent"
                      >
                        {days}
                      </motion.div>
                      <div className="text-xs text-muted-foreground mt-1">days</div>

                      {/* Stage indicator dot */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                          i === 0
                            ? 'bg-red-400'
                            : i === 1
                            ? 'bg-orange-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                    </div>

                    {/* Label */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 + i * 0.1 }}
                      className="text-[10px] text-center text-muted-foreground/60 mt-2"
                    >
                      {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'} review
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Progress preview */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: -10 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className={`w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold ${
                        i <= 2
                          ? 'bg-violet-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {i}
                    </motion.div>
                  ))}
                </div>
                <span className="text-xs">Complete all 5 stages to master a chapter</span>
              </div>
            </motion.div>

            {/* CTA Button with animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onStartStudySession}
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30"
                >
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                  </motion.span>
                  Start First Study Session
                </Button>
              </motion.div>
              <p className="text-xs text-muted-foreground/60 mt-3">
                Takes just 2 minutes to set up
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border overflow-hidden bg-card">
      {/* Header */}
      <div className="relative p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                <Brain className="h-7 w-7 text-white" />
              </div>
              {needsAttention && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {stats.needsAttention}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Smart Revision Schedule
              </h2>
              <p className="text-sm text-muted-foreground">
                Spaced repetition for optimal retention
              </p>
            </div>
          </div>

          {/* Mastery Progress */}
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-medium text-foreground">
                {stats.masteryPercentage}% Mastery
              </span>
            </div>
            <Progress value={stats.masteryPercentage} className="w-32 h-2" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3 rounded-xl bg-muted border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">In Schedule</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>

          <div className={`p-3 rounded-xl border ${
            stats.overdue > 0
              ? 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-900'
              : 'bg-muted border-border'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className={`h-4 w-4 ${
                stats.overdue > 0 ? 'text-red-500' : 'text-muted-foreground'
              }`} />
              <span className={`text-xs font-medium ${
                stats.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
              }`}>Overdue</span>
            </div>
            <p className={`text-2xl font-bold ${
              stats.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'
            }`}>{stats.overdue}</p>
          </div>

          <div className={`p-3 rounded-xl border ${
            stats.dueToday > 0
              ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/50 dark:border-orange-900'
              : 'bg-muted border-border'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className={`h-4 w-4 ${
                stats.dueToday > 0 ? 'text-orange-500' : 'text-muted-foreground'
              }`} />
              <span className={`text-xs font-medium ${
                stats.dueToday > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'
              }`}>Due Today</span>
            </div>
            <p className={`text-2xl font-bold ${
              stats.dueToday > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'
            }`}>{stats.dueToday}</p>
          </div>

          <div className={`p-3 rounded-xl border ${
            stats.mastered > 0
              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900'
              : 'bg-muted border-border'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className={`h-4 w-4 ${
                stats.mastered > 0 ? 'text-emerald-500' : 'text-muted-foreground'
              }`} />
              <span className={`text-xs font-medium ${
                stats.mastered > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
              }`}>Mastered</span>
            </div>
            <p className={`text-2xl font-bold ${
              stats.mastered > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
            }`}>{stats.mastered}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <ScrollArea className="h-[380px]">
          <div className="p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {/* Overdue section */}
              {grouped.overdue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Overdue
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {grouped.overdue.length} chapter{grouped.overdue.length !== 1 ? 's' : ''} need attention
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {grouped.overdue.map((c, i) => renderChapterItem(c, i))}
                  </div>
                </motion.div>
              )}

              {/* Due today section */}
              {grouped.dueToday.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Due Today
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Ready for your daily review
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {grouped.dueToday.map((c, i) => renderChapterItem(c, i))}
                  </div>
                </motion.div>
              )}

              {/* Due this week section */}
              {grouped.dueThisWeek.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Due This Week
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Coming up soon
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {grouped.dueThisWeek.slice(0, 5).map((c, i) => renderChapterItem(c, i))}
                    {grouped.dueThisWeek.length > 5 && (
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-foreground"
                      >
                        View {grouped.dueThisWeek.length - 5} more
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Upcoming section */}
              {grouped.upcoming.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Upcoming
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Scheduled for later
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {grouped.upcoming.slice(0, 3).map((c, i) => renderChapterItem(c, i))}
                    {grouped.upcoming.length > 3 && (
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-foreground"
                      >
                        View {grouped.upcoming.length - 3} more
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>
                Based on the forgetting curve: review at{' '}
                <span className="font-medium text-foreground">1, 3, 7, 14, 30</span> day intervals
              </span>
            </div>
            {needsAttention && (
              <Button
                size="sm"
                onClick={() => {
                  const firstDue = grouped.overdue[0] || grouped.dueToday[0];
                  if (firstDue) {
                    onReviewChapter?.(firstDue.bookId, firstDue.chapterIndex);
                  }
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-500"
              >
                Start Review Session
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
