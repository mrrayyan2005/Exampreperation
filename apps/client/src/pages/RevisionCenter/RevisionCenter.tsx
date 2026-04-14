import React, { useEffect, useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchBooks } from '@/redux/slices/bookSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RefreshCw,
  Brain,
  TrendingUp,
  Calendar,
  BookOpen,
  Award,
  Target,
  BarChart3,
  Layers
} from 'lucide-react';
import RevisionTimeline from './components/RevisionTimeline';
import TestAnalytics from './components/TestAnalytics';
import ChapterGrid from './components/ChapterGrid';
import { SpacedRepetitionWidget } from './components/SpacedRepetitionWidget';
import { RevisionLogDialog } from './components/RevisionLogDialog';

// Types
interface RevisionStats {
  totalRevisions: number;
  totalTests: number;
  averageTestScore: number;
  chaptersNeedingRevision: number;
  completedChapters: number;
  totalChapters: number;
  revisionStreak: number;
  subjectsWithActivity: string[];
}

// Use components directly without memo wrappers to avoid potential hook issues in some React versions
const RevisionCenter = () => {
  const dispatch = useAppDispatch();
  const { books, isLoading } = useAppSelector((state) => state.books);
  const [activeTab, setActiveTab] = useState('overview');

  // Revision dialog state (shared for Overview tab)
  const [revisionDialog, setRevisionDialog] = useState<{
    isOpen: boolean;
    bookId: string;
    chapterIndex: number;
    chapterName: string;
    bookTitle: string;
    currentStage: number;
  }>({
    isOpen: false,
    bookId: '',
    chapterIndex: 0,
    chapterName: '',
    bookTitle: '',
    currentStage: 0
  });

  const handleReviewChapter = (bookId: string, chapterIndex: number) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const chapter = book.chapters?.[chapterIndex];
    if (!chapter) return;

    setRevisionDialog({
      isOpen: true,
      bookId,
      chapterIndex,
      chapterName: chapter.name,
      bookTitle: book.title,
      currentStage: chapter.revisionStage || 0
    });
  };

  const closeRevisionDialog = () => {
    setRevisionDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Fetch books only on mount
  useEffect(() => {
    dispatch(fetchBooks({}));
  }, [dispatch]);

  // Calculate comprehensive statistics
  const stats: RevisionStats = useMemo(() => {
    let totalRevisions = 0;
    let totalTests = 0;
    let totalTestScore = 0;
    let totalTestMarks = 0;
    let chaptersNeedingRevision = 0;
    let completedChapters = 0;
    let totalChapters = 0;
    const subjectsSet = new Set<string>();

    books.forEach(book => {
      subjectsSet.add(book.subject);
      book.chapters?.forEach(chapter => {
        totalChapters++;
        if (chapter.status === 'completed') {
          completedChapters++;
        }
        if (chapter.status === 'needs_revision') {
          chaptersNeedingRevision++;
        }
        if (chapter.revisions) {
          totalRevisions += chapter.revisions.length;
        }
        if (chapter.tests) {
          totalTests += chapter.tests.length;
          chapter.tests.forEach(test => {
            totalTestScore += test.score;
            totalTestMarks += test.totalMarks;
          });
        }
      });
    });

    const averageTestScore = totalTestMarks > 0
      ? Math.round((totalTestScore / totalTestMarks) * 100)
      : 0;

    return {
      totalRevisions,
      totalTests,
      averageTestScore,
      chaptersNeedingRevision,
      completedChapters,
      totalChapters,
      revisionStreak: 0,
      subjectsWithActivity: Array.from(subjectsSet)
    };
  }, [books]);

  const overallProgress = stats.totalChapters > 0
    ? Math.round((stats.completedChapters / stats.totalChapters) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-primary">Revision</span> Center
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track your learning progress, revisions, and test performance across all subjects
          </p>
        </div>
      </motion.div>

      {/* Stats Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revisions</p>
                <h3 className="text-3xl font-bold mt-1">{stats.totalRevisions}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tests Taken</p>
                <h3 className="text-3xl font-bold mt-1">{stats.totalTests}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            {stats.totalTests > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Score</span>
                  <span className="font-medium">{stats.averageTestScore}%</span>
                </div>
                <Progress value={stats.averageTestScore} className="h-2 mt-1" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Need Revision</p>
                <h3 className="text-3xl font-bold mt-1">{stats.chaptersNeedingRevision}</h3>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Chapters flagged for review
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <h3 className="text-3xl font-bold mt-1">{overallProgress}%</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-3">
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedChapters} of {stats.totalChapters} chapters completed
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Tests</span>
            </TabsTrigger>
            <TabsTrigger value="chapters" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Chapters</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SpacedRepetitionWidget
              books={books}
              onStartStudySession={() => setActiveTab('chapters')}
              onReviewChapter={handleReviewChapter}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Active Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.subjectsWithActivity.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stats.subjectsWithActivity.map((subject, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No subjects with activity yet. Start adding books and tracking your progress!
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                    Revision Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Revision Sessions</span>
                    <span className="text-2xl font-bold">{stats.totalRevisions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Chapters Completed</span>
                    <span className="text-2xl font-bold">{stats.completedChapters}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Needing Review</span>
                    <span className="text-2xl font-bold text-orange-600">{stats.chaptersNeedingRevision}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-500" />
                    Test Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tests Completed</span>
                    <span className="text-2xl font-bold">{stats.totalTests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className={`text-2xl font-bold ${
                      stats.averageTestScore >= 80 ? 'text-green-600' :
                      stats.averageTestScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stats.averageTestScore}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Performance</span>
                      <span className="font-medium">
                        {stats.averageTestScore >= 80 ? 'Excellent' :
                         stats.averageTestScore >= 60 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                    <Progress
                      value={stats.averageTestScore}
                      className={`h-2 ${
                        stats.averageTestScore >= 80 ? 'bg-green-100' :
                        stats.averageTestScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <RevisionTimeline books={books} />
          </TabsContent>

          <TabsContent value="tests">
            <TestAnalytics books={books} />
          </TabsContent>

          <TabsContent value="chapters">
            <ChapterGrid books={books} />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Shared Revision Log Dialog for Overview widget */}
      <RevisionLogDialog
        isOpen={revisionDialog.isOpen}
        onClose={closeRevisionDialog}
        bookId={revisionDialog.bookId}
        chapterIndex={revisionDialog.chapterIndex}
        chapterName={revisionDialog.chapterName}
        bookTitle={revisionDialog.bookTitle}
        currentStage={revisionDialog.currentStage}
      />
    </motion.div>
  );
};

export default RevisionCenter;
