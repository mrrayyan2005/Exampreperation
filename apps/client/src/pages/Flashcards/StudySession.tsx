import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import flashcardApi, { Flashcard } from '@/api/flashcardApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Keyboard, ArrowLeft, RotateCw, CheckCircle, Lightbulb, Trophy, RotateCcw, ChevronLeft, ChevronRight, Play, Pause, Shuffle, Settings2, Sparkles, MoveRight, MoveLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const StudySession = () => {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Data state
    const [allCards, setAllCards] = useState<Flashcard[]>([]);
    const [cards, setCards] = useState<Flashcard[]>([]);

    // Playback state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
    const [sessionComplete, setSessionComplete] = useState(false);

    // Feature state
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [studyMode, setStudyMode] = useState<'all' | 'due'>('all');
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    const sessionKey = deckId ? `flashcards.session.${deckId}` : '';

    // Drag setup for Framer Motion
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    useEffect(() => {
        if (deckId) fetchCards();
        return () => stopAutoPlay();
    }, [deckId, studyMode]);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const fetchedCards = studyMode === 'due'
                ? await flashcardApi.getDueCards(deckId)
                : await flashcardApi.getCardsByDeck(deckId!);

            setAllCards(fetchedCards);
            setCards(isShuffle ? [...fetchedCards].sort(() => Math.random() - 0.5) : fetchedCards);
            setCurrentIndex(0);
            setIsFlipped(false);
            setSessionComplete(fetchedCards.length === 0 && studyMode === 'due');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load cards',
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleShuffle = () => {
        setIsShuffle(prev => {
            const newShuffle = !prev;
            if (newShuffle) {
                const shuffled = [...cards].sort(() => Math.random() - 0.5);
                setCards(shuffled);
            } else {
                setCards(allCards);
            }
            setCurrentIndex(0);
            setIsFlipped(false);
            return newShuffle;
        });
    };

    const handleNext = useCallback(() => {
        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setShowHint(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            setSessionComplete(true);
            stopAutoPlay();
        }
    }, [currentIndex, cards.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setShowHint(false);
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const handleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    // Reset drag position on card change
    useEffect(() => {
        x.set(0);
    }, [currentIndex, x]);

    // Auto-play logic
    useEffect(() => {
        if (isAutoPlay) {
            autoPlayRef.current = setInterval(() => {
                if (!isFlipped) {
                    handleFlip();
                } else {
                    handleNext();
                }
            }, 3000);
        } else {
            stopAutoPlay();
        }
        return () => stopAutoPlay();
    }, [isAutoPlay, isFlipped, handleNext, handleFlip]);

    const stopAutoPlay = () => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }
    };

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.target instanceof HTMLElement) {
                const tagName = event.target.tagName.toLowerCase();
                if (['input', 'textarea', 'select'].includes(tagName)) return;
            }

            if (event.code === 'Space') {
                event.preventDefault();
                handleFlip();
            } else if (event.code === 'ArrowRight') {
                handleNext();
            } else if (event.code === 'ArrowLeft') {
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleFlip, handleNext, handlePrev]);

    const handleRate = async (quality: number) => {
        const currentCard = cards[currentIndex];
        try {
            await flashcardApi.submitReview(currentCard._id, quality);
            setSessionStats(prev => ({
                reviewed: prev.reviewed + 1,
                correct: quality >= 3 ? prev.correct + 1 : prev.correct
            }));
            handleNext();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to submit review',
            });
        }
    };

    const handleDragEnd = async (event: any, info: any) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            // Swiped Right - Know it
            await handleRate(4); // Good
        } else if (info.offset.x < -threshold) {
            // Swiped Left - Still learning
            await handleRate(1); // Hard/Again
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <RotateCw className="h-8 w-8 text-indigo-500" />
        </motion.div>
    </div>;

    if (sessionComplete) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-8 py-12 px-4">
                <motion.div
                    initial={{ scale: 0, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="relative"
                >
                    <Trophy className="h-32 w-32 text-indigo-500 drop-shadow-xl" />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-8 rounded-full border-4 border-indigo-400/30"
                    />
                </motion.div>

                <div className="text-center space-y-4 z-10">
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"
                    >
                        Way to go!
                    </motion.h2>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-slate-600 dark:text-slate-300"
                    >
                        You've reviewed all the cards for now.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Button
                        onClick={() => {
                            setSessionComplete(false);
                            setCurrentIndex(0);
                            setIsFlipped(false);
                        }}
                        size="lg"
                        className="gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white px-8 py-6 text-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <RotateCcw className="h-5 w-5" /> Start Over
                    </Button>
                    <Button
                        onClick={() => navigate("/flashcards")}
                        size="lg"
                        className="gap-2 rounded-xl border-0 bg-indigo-600 hover:bg-indigo-700 px-8 py-6 text-white text-lg font-semibold shadow-lg hover:shadow-indigo-500/25"
                    >
                        <CheckCircle className="h-5 w-5" /> Done
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-slate-50 dark:bg-slate-900">
                <Sparkles className="h-16 w-16 text-slate-400" />
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">No cards here</h2>
                <p className="text-muted-foreground">This deck doesn't have any cards for this mode right now.</p>
                <div className="flex gap-4 mt-4">
                    <Button onClick={() => setStudyMode('all')} variant="outline">View All Cards</Button>
                    <Button onClick={() => navigate('/flashcards')}>Back to Decks</Button>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    // Calculate how many cards to show in stack
    const visibleCards = cards.slice(currentIndex, currentIndex + 3);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 sm:px-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/flashcards')} className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">Flashcard Master</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0 rounded-md">
                                    {currentIndex + 1} / {cards.length}
                                </Badge>
                                {studyMode === 'due' && (
                                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">Due Mode</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center flex-1 max-w-sm mx-4 hidden md:block">
                        <Progress value={((currentIndex) / cards.length) * 100} className="h-2 w-full bg-slate-100 dark:bg-slate-800" />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2 mr-4 hidden lg:flex rounded-full border border-slate-200 dark:border-slate-800 px-3 py-1.5 bg-white dark:bg-slate-900">
                            <Label htmlFor="mode-switch" className="text-xs font-medium cursor-pointer text-slate-500 dark:text-slate-400">Due Only</Label>
                            <Switch
                                id="mode-switch"
                                checked={studyMode === 'due'}
                                onCheckedChange={(checked) => setStudyMode(checked ? 'due' : 'all')}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleShuffle}
                            className={`rounded-full ${isShuffle ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500'}`}
                        >
                            <Shuffle className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsAutoPlay(!isAutoPlay)}
                            className={`rounded-full ${isAutoPlay ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500'}`}
                        >
                            {isAutoPlay ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Progress */}
            <div className="md:hidden w-full h-1 bg-slate-200 dark:bg-slate-800">
                <div
                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden w-full max-w-5xl mx-auto">

                {/* 3D Stack View */}
                <div className="relative w-full max-w-3xl aspect-[4/3] sm:aspect-[16/9] max-h-[60vh] perspective-1000 my-8">
                    <AnimatePresence>
                        {visibleCards.map((card, index) => {
                            const isTop = index === 0;
                            const isFlippedNow = isTop && isFlipped;

                            return (
                                <motion.div
                                    key={card._id + (isTop ? '-top' : `-${index}`)}
                                    className="absolute inset-0 w-full h-full"
                                    style={isTop ? { x, rotate, opacity } : {}}
                                    drag={isTop ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragSnapToOrigin={true}
                                    onDragEnd={isTop ? handleDragEnd : undefined}
                                    initial={{
                                        scale: 0.95 - (index * 0.05),
                                        y: index * 20,
                                        opacity: 1 - (index * 0.2),
                                        rotateX: 0,
                                        rotateY: 0
                                    }}
                                    animate={{
                                        scale: 1 - (index * 0.05),
                                        y: index * 20,
                                        opacity: index >= 3 ? 0 : 1 - (index * 0.2),
                                        rotateY: isFlippedNow ? 180 : 0,
                                        zIndex: 3 - index,
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25,
                                        rotateY: { duration: 0.6, type: "spring", stiffness: 200, damping: 20 }
                                    }}
                                >
                                    <div
                                        onClick={() => isTop && handleFlip()}
                                        className={`w-full h-full rounded-2xl sm:rounded-3xl shadow-2xl cursor-pointer preserve-3d border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-900 group ${isTop && !isAutoPlay ? 'hover:shadow-indigo-500/10' : ''} transition-shadow duration-300`}
                                    >

                                        {/* Front */}
                                        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900">
                                            {isTop && (
                                                <div className="absolute top-4 sm:top-6 flex w-full px-6 justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Badge variant="outline" className="text-slate-400 border-slate-200 dark:border-slate-800 font-normal">Click to flip</Badge>
                                                    {card.hint && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }}
                                                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 h-8 text-xs font-medium"
                                                        >
                                                            <Sparkles className="h-3 w-3 mr-1" /> {showHint ? 'Hide Hint' : 'Hint'}
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-800 dark:text-slate-100 leading-tight">
                                                {card.front}
                                            </h3>

                                            {card.hint && showHint && isTop && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-8 text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-lg inline-block"
                                                >
                                                    💡 {card.hint}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Back */}
                                        <div
                                            className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-indigo-50 dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-500/20"
                                            style={{ transform: "rotateY(180deg)" }}
                                        >
                                            <div className="absolute top-6 flex w-full px-6 justify-center items-center opacity-50">
                                                <span className="text-xs uppercase tracking-widest font-semibold text-indigo-400">Answer</span>
                                            </div>

                                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium text-indigo-900 dark:text-indigo-100 leading-tight">
                                                {card.back}
                                            </h3>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Swipe Helpers overlay */}
                    <div className="absolute inset-y-0 left-0 w-16 pointer-events-none flex items-center justify-start opacity-0 -ml-16 peer-hover:opacity-100 hidden md:flex">
                        <div className="bg-rose-500/10 text-rose-500 p-2 rounded-full backdrop-blur-sm -rotate-90 origin-left whitespace-nowrap text-sm font-bold tracking-widest uppercase">
                            Swipe Still Learning
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full max-w-3xl flex flex-col gap-6 mt-4">
                    {/* Navigation Bar */}
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-2xl sm:rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="h-12 w-12 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>

                        <div className="flex-1 flex gap-2 justify-center px-2">
                            {studyMode === 'due' ? (
                                // SRS Review Buttons
                                <div className="flex items-center gap-1 sm:gap-2 w-full max-w-sm">
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); handleRate(1); }}
                                        className="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-400 font-semibold border-0 h-10 sm:h-12 rounded-xl"
                                    >
                                        Again <span className="hidden sm:inline ml-1 opacity-50 text-xs"> (1)</span>
                                    </Button>
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); handleRate(4); }}
                                        className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-400 font-semibold border-0 h-10 sm:h-12 rounded-xl"
                                    >
                                        Good <span className="hidden sm:inline ml-1 opacity-50 text-xs"> (2)</span>
                                    </Button>
                                </div>
                            ) : (
                                // Just simple browse 
                                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Keyboard className="h-4 w-4" /> Use arrow keys & spacebar
                                </span>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNext}
                            className="h-12 w-12 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudySession;
