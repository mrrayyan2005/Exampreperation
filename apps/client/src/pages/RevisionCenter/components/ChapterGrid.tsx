import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/redux/hooks';
import { addTestToChapter } from '@/redux/slices/bookSlice';
import {
  Layers,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Award,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  FolderOpen,
  Calendar,
  RotateCcw,
  Brain,
  PlusCircle
} from 'lucide-react';
import { Book, Chapter } from '@/redux/slices/bookSlice';
import {
  getDaysUntilRevision,
  getRevisionStatusText
} from '@/lib/spacedRepetition';
import { RevisionLogDialog } from './RevisionLogDialog';

interface ChapterGridProps {
  books: Book[];
}

interface ChapterWithBook {
  id: string;
  chapter: Chapter;
  bookTitle: string;
  subject: string;
  bookId: string;
  chapterIndex: number;
}

const ChapterGrid = ({ books }: ChapterGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [addingTestToChapter, setAddingTestToChapter] = useState<string | null>(null);
  const [testForm, setTestForm] = useState({ score: '', totalMarks: '100' });

  // Revision dialog state
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

  const openRevisionDialog = (chapter: ChapterWithBook) => {
    setRevisionDialog({
      isOpen: true,
      bookId: chapter.bookId,
      chapterIndex: chapter.chapterIndex,
      chapterName: chapter.chapter.name,
      bookTitle: chapter.bookTitle,
      currentStage: chapter.chapter.revisionStage || 0
    });
  };

  const closeRevisionDialog = () => {
    setRevisionDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Aggregate all chapters from all books
  const allChapters: ChapterWithBook[] = useMemo(() => {
    const chapters: ChapterWithBook[] = [];

    books.forEach(book => {
      book.chapters?.forEach((chapter, index) => {
        chapters.push({
          id: `${book.id}-${index}`,
          chapter,
          bookTitle: book.title,
          subject: book.subject,
          bookId: book.id,
          chapterIndex: index
        });
      });
    });

    return chapters;
  }, [books]);

  // Get unique subjects
  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();
    books.forEach(book => subjectSet.add(book.subject));
    return Array.from(subjectSet).sort();
  }, [books]);

  // Filter chapters by search and status
  const filteredChapters = useMemo(() => {
    return allChapters.filter(({ chapter, bookTitle }) => {
      const matchesSearch =
        chapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.status.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || chapter.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allChapters, searchTerm, statusFilter]);

  // Group filtered chapters by subject
  const chaptersBySubject = useMemo(() => {
    const groups: { [key: string]: ChapterWithBook[] } = {};

    filteredChapters.forEach(item => {
      const subject = item.subject;
      if (!groups[subject]) {
        groups[subject] = [];
      }
      groups[subject].push(item);
    });

    // Sort subjects alphabetically
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [filteredChapters]);

  // Calculate stats per subject
  const getSubjectStats = (chapters: ChapterWithBook[]) => {
    const total = chapters.length;
    const completed = chapters.filter(c => c.chapter.status === 'completed').length;
    const inProgress = chapters.filter(c => c.chapter.status === 'in_progress').length;
    const needsRevision = chapters.filter(c => c.chapter.status === 'needs_revision').length;
    const notStarted = chapters.filter(c => c.chapter.status === 'not_started').length;

    return {
      total,
      completed,
      inProgress,
      needsRevision,
      notStarted,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const toggleSubject = (subject: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject);
    } else {
      newExpanded.add(subject);
    }
    setExpandedSubjects(newExpanded);
  };

  const expandAll = () => setExpandedSubjects(new Set(subjects));
  const collapseAll = () => setExpandedSubjects(new Set());

  // Calculate stats
  const stats = useMemo(() => {
    const total = allChapters.length;
    const completed = allChapters.filter(c => c.chapter.status === 'completed').length;
    const inProgress = allChapters.filter(c => c.chapter.status === 'in_progress').length;
    const needsRevision = allChapters.filter(c => c.chapter.status === 'needs_revision').length;
    const notStarted = allChapters.filter(c => c.chapter.status === 'not_started').length;
    
    const totalRevisions = allChapters.reduce((sum, c) => sum + (c.chapter.revisions?.length || 0), 0);
    const totalTests = allChapters.reduce((sum, c) => sum + (c.chapter.tests?.length || 0), 0);
    
    return {
      total,
      completed,
      inProgress,
      needsRevision,
      notStarted,
      totalRevisions,
      totalTests,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [allChapters]);

  // Subject color palette for visual distinction
  const getSubjectColor = (subject: string) => {
    const colors = [
      { bg: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', gradient: 'from-blue-500 to-blue-600' },
      { bg: 'bg-purple-500', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', gradient: 'from-purple-500 to-purple-600' },
      { bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', gradient: 'from-emerald-500 to-emerald-600' },
      { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', gradient: 'from-orange-500 to-orange-600' },
      { bg: 'bg-pink-500', light: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', gradient: 'from-pink-500 to-pink-600' },
      { bg: 'bg-cyan-500', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', gradient: 'from-cyan-500 to-cyan-600' },
      { bg: 'bg-indigo-500', light: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', gradient: 'from-indigo-500 to-indigo-600' },
      { bg: 'bg-rose-500', light: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', gradient: 'from-rose-500 to-rose-600' },
    ];
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20';
      case 'needs_revision': return 'bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'needs_revision': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <Layers className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Done';
      case 'in_progress': return 'Active';
      case 'needs_revision': return 'Review';
      default: return 'Pending';
    }
  };

  const renderChapterCard = (chapterWithBook: ChapterWithBook) => {
    const { chapter, bookTitle, subject, bookId, chapterIndex } = chapterWithBook;
    const daysUntil = chapter.nextRevisionDate ? getDaysUntilRevision(chapter.nextRevisionDate) : null;
    const showRevisionInfo = chapter.nextRevisionDate && chapter.revisions && chapter.revisions.length > 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
          {/* Top accent line */}
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${
            chapter.status === 'completed' ? 'bg-emerald-500' :
            chapter.status === 'in_progress' ? 'bg-blue-500' :
            chapter.status === 'needs_revision' ? 'bg-amber-500' :
            'bg-slate-300'
          }`} />

          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                chapter.status === 'completed' ? 'bg-emerald-500/10' :
                chapter.status === 'in_progress' ? 'bg-blue-500/10' :
                chapter.status === 'needs_revision' ? 'bg-amber-500/10' :
                'bg-slate-100'
              }`}>
                {getStatusIcon(chapter.status)}
              </div>

              <div className="flex-1 min-w-0">
                {/* Chapter Name */}
                <h4 className="font-semibold text-sm leading-tight mb-1 truncate group-hover:text-primary transition-colors">
                  {chapter.name}
                </h4>

                {/* Book Title */}
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <BookOpen className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{bookTitle}</span>
                </p>

                {/* Status Badge */}
                <Badge
                  variant="outline"
                  className={`text-xs font-medium transition-colors ${getStatusColor(chapter.status)}`}
                >
                  {getStatusLabel(chapter.status)}
                </Badge>
              </div>
            </div>

            {/* Spaced Repetition Info */}
            {showRevisionInfo && daysUntil !== null && (
              <div className={`mt-3 p-2 rounded-lg ${
                daysUntil < 0 ? 'bg-red-50 border border-red-100' :
                daysUntil === 0 ? 'bg-amber-50 border border-amber-100' :
                daysUntil <= 3 ? 'bg-yellow-50 border border-yellow-100' :
                'bg-blue-50 border border-blue-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className={`h-3 w-3 ${
                      daysUntil < 0 ? 'text-red-500' :
                      daysUntil === 0 ? 'text-amber-500' :
                      daysUntil <= 3 ? 'text-yellow-600' :
                      'text-blue-500'
                    }`} />
                    <span className={`text-xs font-medium ${
                      daysUntil < 0 ? 'text-red-600' :
                      daysUntil === 0 ? 'text-amber-600' :
                      daysUntil <= 3 ? 'text-yellow-700' :
                      'text-blue-600'
                    }`}>
                      {getRevisionStatusText(daysUntil)}
                    </span>
                  </div>
                  {/* Stage indicator */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Stage</span>
                    <div className="flex gap-0.5">
                      {[0, 1, 2, 3, 4].map((stage) => (
                        <div
                          key={stage}
                          className={`w-1.5 h-1.5 rounded-full ${
                            stage <= (chapter.revisionStage || 0)
                              ? 'bg-primary'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-border/50 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
                onClick={() => openRevisionDialog(chapterWithBook)}
              >
                <RefreshCw className="h-4 w-4" />
                Revision
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                onClick={() => {
                  if (addingTestToChapter === chapterWithBook.id) setAddingTestToChapter(null);
                  else {
                    setAddingTestToChapter(chapterWithBook.id);
                    setTestForm({ score: '', totalMarks: '100' });
                  }
                }}
              >
                <Award className="h-4 w-4" />
                Add Test
              </Button>
            </div>

            {/* Inline Test Form */}
            <AnimatePresence>
              {addingTestToChapter === chapterWithBook.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 bg-muted/40 rounded-lg border border-border shadow-inner space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Score</Label>
                      <Input
                        type="number"
                        value={testForm.score}
                        onChange={e => setTestForm({...testForm, score: e.target.value})}
                        className="h-8 text-xs bg-background/80"
                        placeholder="0"
                        autoFocus
                      />
                    </div>
                    <div className="text-muted-foreground flex items-end pb-1.5 font-light text-xl">/</div>
                    <div className="flex-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Out Of</Label>
                      <Input
                        type="number"
                        value={testForm.totalMarks}
                        onChange={e => setTestForm({...testForm, totalMarks: e.target.value})}
                        className="h-8 text-xs bg-background/80"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs font-medium"
                    disabled={!testForm.score || !testForm.totalMarks}
                    onClick={async () => {
                      try {
                        await dispatch(addTestToChapter({
                          bookId: bookId,
                          chapterIndex: chapterIndex,
                          testData: {
                            testName: `Attempt ${(chapter.tests?.length || 0) + 1}`,
                            score: Number(testForm.score) || 0,
                            totalMarks: Number(testForm.totalMarks) || 100,
                            notes: ''
                          }
                        })).unwrap();
                        setAddingTestToChapter(null);
                        toast({ title: 'Test Logged!', description: 'Your score has been correctly mapped.', duration: 3000 });
                      } catch (error) {
                        toast({ variant: 'destructive', title: 'Failed to save test attempt', duration: 3000 });
                      }
                    }}
                  >
                    Save Attempt
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Historical Score List */}
            {chapter.tests && chapter.tests.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                {chapter.tests.slice(-3).reverse().map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-muted/30 rounded-md border border-border/30">
                    <span className="text-muted-foreground truncate font-medium">{t.testName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono tracking-tight">{t.score}/{t.totalMarks}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        (t.score/t.totalMarks) >= 0.8 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                        (t.score/t.totalMarks) >= 0.5 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                        'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                      }`}>
                        {Math.round((t.score / (t.totalMarks || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <RefreshCw className="h-3 w-3 text-blue-500" />
                </div>
                <span className="text-muted-foreground font-medium">{chapter.revisions?.length || 0} Attempts</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Award className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-muted-foreground font-medium">{chapter.tests?.length || 0} Attempts</span>
              </div>
              {chapter.priority && (
                <div className="ml-auto">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      chapter.priority === 'high' ? 'bg-rose-500/10 text-rose-700 border-rose-500/20' :
                      chapter.priority === 'medium' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                    }`}
                  >
                    {chapter.priority}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (allChapters.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <Layers className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No chapters yet</h3>
            <p className="text-muted-foreground max-w-md">
              Start adding books and chapters to track your learning progress. Each chapter can have revisions and tests tracked.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chapters by name, book, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-background/50">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="needs_revision">Needs Revision</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAll}
                    className="hidden sm:flex bg-background/50"
                  >
                    <FolderOpen className="h-4 w-4 mr-1.5" />
                    Expand
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAll}
                    className="hidden sm:flex bg-background/50"
                  >
                    <ChevronRight className="h-4 w-4 mr-1.5" />
                    Collapse
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="font-normal">
                {filteredChapters.length} chapters
              </Badge>
              <span>across</span>
              <Badge variant="secondary" className="font-normal">
                {Object.keys(chaptersBySubject).length} subjects
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subjects with Chapters */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {Object.entries(chaptersBySubject).map(([subject, chapters], subjectIndex) => {
            const stats = getSubjectStats(chapters);
            const isExpanded = expandedSubjects.has(subject);
            const colors = getSubjectColor(subject);

            return (
              <motion.div
                key={subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + subjectIndex * 0.05 }}
              >
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleSubject(subject)}
                >
                  <Card className={`overflow-hidden border-0 shadow-sm transition-shadow duration-300 ${isExpanded ? 'shadow-md' : 'hover:shadow-md'}`}>
                    {/* Subject Header */}
                    <CollapsibleTrigger asChild>
                      <div className="cursor-pointer group">
                        {/* Top accent bar */}
                        <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />

                        <CardContent className="p-0">
                          <div className="p-4 flex items-center gap-4">
                            {/* Expand Icon */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${colors.light}`}>
                              {isExpanded ? (
                                <ChevronDown className={`h-4 w-4 ${colors.text}`} />
                              ) : (
                                <ChevronRight className={`h-4 w-4 ${colors.text}`} />
                              )}
                            </div>

                            {/* Subject Icon & Name */}
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shadow-sm`}>
                                <GraduationCap className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-base">{subject}</h3>
                                <p className="text-xs text-muted-foreground">{stats.total} chapters</p>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="hidden sm:flex items-center gap-2 ml-auto">
                              {/* Status pills */}
                              <div className="flex items-center gap-1.5">
                                {stats.completed > 0 && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-medium">
                                    <CheckCircle className="h-3 w-3" />
                                    {stats.completed}
                                  </div>
                                )}
                                {stats.needsRevision > 0 && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-medium">
                                    <AlertTriangle className="h-3 w-3" />
                                    {stats.needsRevision}
                                  </div>
                                )}
                                {stats.inProgress > 0 && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-medium">
                                    <Clock className="h-3 w-3" />
                                    {stats.inProgress}
                                  </div>
                                )}
                              </div>

                              {/* Progress */}
                              <div className="flex items-center gap-2 ml-4 min-w-[100px]">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.progressPercentage}%` }}
                                    transition={{ duration: 0.5, delay: 0.6 + subjectIndex * 0.05 }}
                                    className={`h-full rounded-full ${colors.bg}`}
                                  />
                                </div>
                                <span className="text-xs font-medium w-8 text-right">{stats.progressPercentage}%</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </CollapsibleTrigger>

                    {/* Chapters Grid */}
                    <CollapsibleContent>
                      <div className="border-t bg-muted/30">
                        <div className="p-4">
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {chapters.map(renderChapterCard)}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </motion.div>
            );
          })}

          {filteredChapters.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No chapters found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Revision Log Dialog */}
      <RevisionLogDialog
        isOpen={revisionDialog.isOpen}
        onClose={closeRevisionDialog}
        bookId={revisionDialog.bookId}
        chapterIndex={revisionDialog.chapterIndex}
        chapterName={revisionDialog.chapterName}
        bookTitle={revisionDialog.bookTitle}
        currentStage={revisionDialog.currentStage}
      />
    </div>
  );
};

export default ChapterGrid;