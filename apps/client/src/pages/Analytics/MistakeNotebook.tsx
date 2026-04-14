import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Brain, Target, TrendingUp, Filter, RotateCcw, BookOpen, Zap } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { toast } from '@/components/ui/use-toast';
import flashcardApi, { Deck } from '@/api/flashcardApi';
import { useDebounce } from '@/hooks/useDebounce';

interface Mistake {
    _id: string;
    attemptId: string;
    testTitle: string;
    question: {
        _id: string;
        text: string;
        options: { id: string; text: string }[];
        correctOption: string;
        explanation: string;
        topic: string;
        difficulty: 'easy' | 'medium' | 'hard';
    };
    selectedOption: string;
    analysis?: string;
    notes?: string;
    date: string;
    isAnalyzed: boolean;
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

const MistakeNotebook = () => {
    const navigate = useNavigate();
    const [mistakes, setMistakes] = useState<Mistake[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);

    // Filters
    const [topicFilter, setTopicFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [sortBy, setSortBy] = useState<'date' | 'difficulty' | 'frequency'>('date');
    const [currentPage, setCurrentPage] = useState(1);

    // Dialog states
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [analysisForm, setAnalysisForm] = useState({ type: '', notes: '' });
    const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null);

    // Flashcard conversion states
    const [showConvertDialog, setShowConvertDialog] = useState(false);
    const [convertingMistakeId, setConvertingMistakeId] = useState<string | null>(null);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeckId, setSelectedDeckId] = useState('');
    const [newDeckName, setNewDeckName] = useState('');
    const [creatingDeck, setCreatingDeck] = useState(false);
    const [convertingCard, setConvertingCard] = useState(false);

    // Get unique topics for filter dropdown
    const uniqueTopics = useMemo(() => {
        const topics = new Set((mistakes || []).map(m => m.question.topic));
        return Array.from(topics).sort();
    }, [mistakes]);

    const fetchMistakes = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (topicFilter) params.append('topic', topicFilter);
            if (difficultyFilter) params.append('difficulty', difficultyFilter);
            if (statusFilter) params.append('analysisStatus', statusFilter);
            if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
            params.append('sortBy', sortBy);
            params.append('page', currentPage.toString());
            params.append('limit', '20');

            const res = await axiosInstance.get(`/tests/attempts/mistakes?${params}`);
            setMistakes(res.data.data || []);
            setPagination(res.data.pagination || { total: 0, page: 1, limit: 20, pages: 0 });
        } catch (error) {
            console.error(error);
            setMistakes([]);
            setPagination({ total: 0, page: 1, limit: 20, pages: 0 });
            toast({ title: 'Error', description: 'Failed to load mistakes', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [topicFilter, difficultyFilter, statusFilter, debouncedSearchQuery, sortBy, currentPage]);

    useEffect(() => {
        fetchMistakes();
    }, [fetchMistakes]);

    const fetchAnalytics = async () => {
        try {
            const [difficulty, timeline, completion] = await Promise.all([
                axiosInstance.get('/tests/mistakes/analytics/by-difficulty'),
                axiosInstance.get('/tests/mistakes/analytics/timeline?days=30'),
                axiosInstance.get('/tests/mistakes/analytics/completion-rate')
            ]);

            setAnalytics({
                difficulty: difficulty.data.data,
                timeline: timeline.data.data,
                completion: completion.data.data
            });
            setShowAnalyticsDialog(true);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to load analytics', variant: 'destructive' });
        }
    };

    const handleAnalyze = (mistake: Mistake) => {
        setAnalyzingId(mistake._id);
        setAnalysisForm({
            type: mistake.analysis || '',
            notes: mistake.notes || ''
        });
    };

    const saveAnalysis = async (attemptId: string, questionId: string) => {
        try {
            await axiosInstance.patch(`/tests/attempts/${attemptId}/analysis`, {
                questionId,
                analysis: analysisForm.type,
                notes: analysisForm.notes
            });

            setMistakes(prev =>
                prev.map(m =>
                    m._id === analyzingId
                        ? {
                              ...m,
                              analysis: analysisForm.type,
                              notes: analysisForm.notes,
                              isAnalyzed: true
                          }
                        : m
                )
            );

            setAnalyzingId(null);
            toast({ title: 'Analysis Saved', description: 'Good job reflecting on your mistake!' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to save analysis', variant: 'destructive' });
        }
    };

    const resetFilters = () => {
        setTopicFilter('');
        setDifficultyFilter('');
        setStatusFilter('');
        setSearchQuery('');
        setSortBy('date');
        setCurrentPage(1);
    };

    const handleOpenConvertDialog = async (mistake: Mistake) => {
        try {
            const decksList = await flashcardApi.getDecks();
            setDecks(decksList);
            setConvertingMistakeId(mistake._id);
            setSelectedDeckId(decksList.length > 0 ? decksList[0]._id : '');
            setNewDeckName('');
            setShowConvertDialog(true);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to load decks', variant: 'destructive' });
        }
    };

    const handleCreateNewDeck = async () => {
        if (!newDeckName.trim()) {
            toast({ title: 'Error', description: 'Please enter a deck name', variant: 'destructive' });
            return;
        }
        try {
            setCreatingDeck(true);
            const newDeck = await flashcardApi.createDeck({
                name: newDeckName,
                topic: newDeckName,
                description: `Created from mistake notebook on ${new Date().toLocaleDateString()}`
            });
            setDecks([...decks, newDeck]);
            setSelectedDeckId(newDeck._id);
            setNewDeckName('');
            toast({ title: 'Success', description: 'New deck created!' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to create deck', variant: 'destructive' });
        } finally {
            setCreatingDeck(false);
        }
    };

    const handleConvertToFlashcard = async () => {
        if (!selectedDeckId || !convertingMistakeId) return;

        const mistake = mistakes.find(m => m._id === convertingMistakeId);
        if (!mistake) return;

        try {
            setConvertingCard(true);
            const front = mistake.question.text;
            const correctAnswer = getOptionText(mistake.question.options, mistake.question.correctOption);
            const back = `Correct Answer: ${correctAnswer}\n\n${mistake.question.explanation}`;

            await flashcardApi.createCard({
                deck: selectedDeckId,
                front,
                back,
                hint: `Topic: ${mistake.question.topic}`
            });

            setShowConvertDialog(false);
            toast({ title: 'Success', description: 'Question converted to flashcard!' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to convert to flashcard', variant: 'destructive' });
        } finally {
            setConvertingCard(false);
        }
    };

    const getOptionText = (options: any[], id: string) => {
        return options.find(o => o.id === id)?.text || id;
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'from-emerald-400 to-teal-500';
            case 'medium':
                return 'from-amber-400 to-orange-500';
            case 'hard':
                return 'from-red-400 to-pink-500';
            default:
                return 'from-gray-400 to-gray-500';
        }
    };

    const getDifficultyBgColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-emerald-500/10 border-emerald-500/20';
            case 'medium':
                return 'bg-amber-500/10 border-amber-500/20';
            case 'hard':
                return 'bg-red-500/10 border-red-500/20';
            default:
                return 'bg-gray-500/10 border-gray-500/20';
        }
    };

    const showFiltersApplied = topicFilter || difficultyFilter || statusFilter || searchQuery;

    if (loading && !mistakes.length) {
        return <div className="flex h-[60vh] items-center justify-center">Loading mistakes...</div>;
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="space-y-2 flex items-start justify-between">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Mistake <span className="text-primary">Notebook</span></h1>
                    <p className="text-muted-foreground">Learn from every mistake. Analyze patterns. Improve faster.</p>
                </div>
                {pagination && pagination.total > 0 && (
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => navigate('/mistakes/analytics')}
                            variant="outline"
                            className="gap-2"
                        >
                            <TrendingUp className="h-4 w-4" /> Analytics
                        </Button>
                        <Button 
                            onClick={() => navigate('/mistakes/practice')}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white gap-2"
                        >
                            <Zap className="h-4 w-4" /> Practice Mode
                        </Button>
                    </div>
                )}
            </div>

            {/* Quick Stats Cards */}
            {pagination && (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-500/10 to-pink-500/10">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Mistakes</p>
                                        <p className="text-2xl font-bold text-red-600">{pagination.total}</p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-red-500/30" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Analyzed</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {mistakes.filter(m => m.isAnalyzed).length}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-blue-500/30" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Completion</p>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {pagination.total > 0
                                                ? Math.round(
                                                      (mistakes.filter(m => m.isAnalyzed).length / pagination.total) * 100
                                                  )
                                                : 0}
                                            %
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-amber-500/30" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 cursor-pointer hover:shadow-md transition-shadow" onClick={fetchAnalytics}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">View</p>
                                        <p className="text-2xl font-bold text-purple-600">Analytics</p>
                                    </div>
                                    <Zap className="h-8 w-8 text-purple-500/30" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filters
                        </h3>
                        {showFiltersApplied && (
                            <Button size="sm" variant="ghost" onClick={resetFilters} className="gap-1">
                                <RotateCcw className="h-3 w-3" /> Reset
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <Input
                                placeholder="Search questions or notes..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Topic</label>
                            <Select
                                value={topicFilter}
                                onValueChange={(val) => {
                                    setTopicFilter(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All topics" />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueTopics.map(topic => (
                                        <SelectItem key={topic} value={topic}>
                                            {topic}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Difficulty</label>
                            <Select
                                value={difficultyFilter}
                                onValueChange={(val) => {
                                    setDifficultyFilter(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={statusFilter}
                                onValueChange={(val) => {
                                    setStatusFilter(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="analyzed">Analyzed</SelectItem>
                                    <SelectItem value="notAnalyzed">Not Analyzed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort By</label>
                            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Recent First</SelectItem>
                                    <SelectItem value="difficulty">Hardest First</SelectItem>
                                    <SelectItem value="frequency">Most Repeated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading ? (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-sm text-muted-foreground">Loading mistakes...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : !mistakes || mistakes.length === 0 ? (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <Card className="border-dashed">
                        <CardContent className="pt-12 pb-12 text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-lg font-medium">No mistakes found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {showFiltersApplied
                                    ? 'Try adjusting your filters to find mistakes'
                                    : 'Take a test and get some wrong answers to populate this notebook'}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {mistakes.map((mistake) => (
                        <motion.div
                            key={mistake._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/50 hover:shadow-lg transition-shadow">
                                <CardHeader className={`pb-3 bg-gradient-to-r ${getDifficultyColor(mistake.question.difficulty)}`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="secondary" className="shrink-0">
                                                    {mistake.question.topic}
                                                </Badge>
                                                <Badge
                                                    className={`shrink-0 bg-gradient-to-r ${getDifficultyColor(
                                                        mistake.question.difficulty
                                                    )} text-white border-0`}
                                                >
                                                    {mistake.question.difficulty.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-base text-white truncate">{mistake.question.text}</CardTitle>
                                            <CardDescription className="text-white/70 text-xs mt-1">
                                                {new Date(mistake.date).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={mistake.isAnalyzed ? 'outline' : 'destructive'}
                                            className={`shrink-0 ${
                                                mistake.isAnalyzed
                                                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                                                    : ''
                                            }`}
                                        >
                                            {mistake.isAnalyzed ? '✓ Analyzed' : 'Pending'}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-6 space-y-4">
                                    {/* Answer Comparison */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <span className="font-semibold text-red-600 flex items-center gap-2 text-sm">
                                                <AlertCircle size={14} /> Your Answer
                                            </span>
                                            <p className="mt-2 text-sm">{getOptionText(mistake.question.options, mistake.selectedOption)}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="font-semibold text-emerald-600 flex items-center gap-2 text-sm">
                                                <CheckCircle size={14} /> Correct Answer
                                            </span>
                                            <p className="mt-2 text-sm">{getOptionText(mistake.question.options, mistake.question.correctOption)}</p>
                                        </div>
                                    </div>

                                    {/* Explanation */}
                                    <div className="bg-muted/50 p-3 rounded-lg border border-border">
                                        <p className="font-medium text-xs text-muted-foreground mb-2">WHY?</p>
                                        <p className="text-sm text-foreground">{mistake.question.explanation}</p>
                                    </div>

                                    {/* Analysis Component */}
                                    {analyzingId === mistake._id ? (
                                        <motion.div
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className="bg-muted/30 border border-border rounded-lg p-4 space-y-4"
                                        >
                                            <h4 className="font-semibold flex items-center gap-2">
                                                <Brain size={16} /> Self-Reflection
                                            </h4>
                                            <div className="grid gap-3">
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block">Why did you get this wrong?</label>
                                                    <Select value={analysisForm.type} onValueChange={(val) => setAnalysisForm(prev => ({ ...prev, type: val }))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select reason..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Concept Gap">Concept Gap (Didn't know)</SelectItem>
                                                            <SelectItem value="Silly Mistake">Silly Mistake (Misread/Error)</SelectItem>
                                                            <SelectItem value="Guessed">Guessed (Luck ran out)</SelectItem>
                                                            <SelectItem value="Time Pressure">Time Pressure</SelectItem>
                                                            <SelectItem value="Confusion">Confused Concepts</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block">Notes for your future self:</label>
                                                    <Textarea
                                                        placeholder="What will you do differently next time?"
                                                        value={analysisForm.notes}
                                                        onChange={(e) => setAnalysisForm(prev => ({ ...prev, notes: e.target.value }))}
                                                        className="min-h-20"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setAnalyzingId(null)}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-500"
                                                    onClick={() => saveAnalysis(mistake.attemptId, mistake.question._id)}
                                                >
                                                    Save Reflection
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-3">
                                            {mistake.isAnalyzed ? (
                                                <div className="flex-1 text-sm">
                                                    <p className="font-medium mb-1">
                                                        Reason: <Badge variant="secondary" className="ml-1">{mistake.analysis}</Badge>
                                                    </p>
                                                    {mistake.notes && (
                                                        <p className="text-muted-foreground text-xs italic mt-2">"{mistake.notes}"</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">Not yet analyzed. Click the button to reflect on this mistake.</p>
                                            )}
                                            <div className="flex gap-2 shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant={mistake.isAnalyzed ? 'outline' : 'default'}
                                                    onClick={() => handleAnalyze(mistake)}
                                                >
                                                    {mistake.isAnalyzed ? 'Edit' : 'Analyze'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenConvertDialog(mistake)}
                                                    className="gap-1"
                                                >
                                                    <BookOpen className="h-3 w-3" /> Convert
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                        Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {pagination.pages}
                    </div>
                    <Button
                        variant="outline"
                        disabled={currentPage === pagination.pages}
                        onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Analytics Dialog */}
            <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Mistake Analytics</DialogTitle>
                    </DialogHeader>
                    {!analytics ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : analytics.difficulty.total === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <p>No mistake data available yet.</p>
                            <p className="text-sm mt-2">Take some tests to see your analytics.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-3">By Difficulty</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(analytics.difficulty)
                                        .filter(([level]) => level !== 'total')
                                        .map(([level, stats]: any) => (
                                            <Card key={level} className="p-4">
                                                <p className="text-xs text-muted-foreground capitalize">{level}</p>
                                                <p className="text-2xl font-bold">{stats.count}</p>
                                                <p className="text-xs text-muted-foreground">{Math.round(stats.percentage)}%</p>
                                            </Card>
                                        ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">Analysis Completion</h4>
                                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                                    <div className="flex items-end gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Analyzed</p>
                                            <p className="text-3xl font-bold text-blue-600">{analytics.completion.analyzed}</p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            of {analytics.completion.total} mistakes ({Math.round(analytics.completion.percentage)}%)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Flashcard Conversion Dialog */}
            <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Convert to Flashcard</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="deck-select" className="text-sm font-medium mb-2 block">Select a Deck</Label>
                            <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                                <SelectTrigger id="deck-select">
                                    <SelectValue placeholder="Choose a deck..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {decks.map(deck => (
                                        <SelectItem key={deck._id} value={deck._id}>
                                            {deck.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm font-medium mb-3">Or Create a New Deck</p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="New deck name..."
                                    value={newDeckName}
                                    onChange={(e) => setNewDeckName(e.target.value)}
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleCreateNewDeck}
                                    disabled={creatingDeck || !newDeckName.trim()}
                                >
                                    {creatingDeck ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </div>

                        {convertingMistakeId && mistakes.find(m => m._id === convertingMistakeId) && (
                            <div className="border-t pt-4 space-y-3">
                                <p className="text-sm font-medium">Preview</p>
                                <div className="space-y-2">
                                    <div className="p-3 bg-muted rounded-lg text-sm">
                                        <p className="font-semibold text-xs text-muted-foreground mb-1">FRONT</p>
                                        <p>{mistakes.find(m => m._id === convertingMistakeId)?.question.text}</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg text-sm">
                                        <p className="font-semibold text-xs text-muted-foreground mb-1">BACK</p>
                                        <p className="line-clamp-3">
                                            Correct Answer: {getOptionText(
                                                mistakes.find(m => m._id === convertingMistakeId)?.question.options || [],
                                                mistakes.find(m => m._id === convertingMistakeId)?.question.correctOption || ''
                                            )}
                                        </p>
                                        <p className="mt-2 text-xs text-muted-foreground">...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConvertToFlashcard}
                            disabled={!selectedDeckId || convertingCard}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500"
                        >
                            {convertingCard ? 'Converting...' : 'Convert to Flashcard'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MistakeNotebook;
