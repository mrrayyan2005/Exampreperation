import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, ArrowLeft, RotateCcw, Trophy, RotateCw } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { toast } from '@/components/ui/use-toast';

interface PracticeQuestion {
    questionId: string;
    text: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    mistakeCount: number;
    questionDetails: {
        _id: string;
        text: string;
        options: { id: string; text: string }[];
        correctOption: string;
        explanation: string;
    };
}

const MistakePracticeMode = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0 });
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    useEffect(() => {
        fetchPracticeQuestions();
    }, []);

    const fetchPracticeQuestions = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/tests/mistakes/practice-mode?limit=20');
            setQuestions(res.data.data);
            setStats({ correct: 0, incorrect: 0, total: res.data.data.length });
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to load practice questions', variant: 'destructive' });
            navigate('/mistakes');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (optionId: string) => {
        if (!showAnswer) {
            setSelectedOption(optionId);
            setShowAnswer(true);
        }
    };

    const handleNext = () => {
        const current = questions[currentIndex];
        const isCorrect = selectedOption === current.questionDetails.correctOption;

        if (isCorrect) {
            setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
        }

        if (currentIndex + 1 >= questions.length) {
            setSessionComplete(true);
        } else {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setShowAnswer(false);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setShowAnswer(false);
        setSessionComplete(false);
        setStats({ correct: 0, incorrect: 0, total: questions.length });
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

    const getOptionText = (options: any[], id: string) => {
        return options.find(o => o.id === id)?.text || id;
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="text-muted-foreground mb-2">Loading practice questions...</div>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
                <Button variant="ghost" onClick={() => navigate('/mistakes')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Mistakes
                </Button>
                <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-lg font-medium">No mistakes to practice</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            You don't have any recent mistakes. Keep taking tests and analyzing your mistakes to practice them here!
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (sessionComplete) {
        const accuracy = Math.round((stats.correct / stats.total) * 100);
        let message = '';
        let messageColor = '';

        if (accuracy === 100) {
            message = '🎉 Perfect! You\'ve mastered these mistakes!';
            messageColor = 'from-emerald-400 to-teal-500';
        } else if (accuracy >= 80) {
            message = '✨ Excellent! You\'re making real progress!';
            messageColor = 'from-blue-400 to-cyan-500';
        } else if (accuracy >= 60) {
            message = '👏 Good progress! Keep practicing!';
            messageColor = 'from-amber-400 to-orange-500';
        } else {
            message = '💪 Keep going! You\'re getting better!';
            messageColor = 'from-pink-400 to-rose-500';
        }

        return (
            <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
                <Button variant="ghost" onClick={() => navigate('/mistakes')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Mistakes
                </Button>

                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                >
                    <Trophy className="h-32 w-32 text-yellow-400 drop-shadow-2xl" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center space-y-4"
                >
                    <h2 className={`text-3xl font-bold bg-gradient-to-r ${messageColor} bg-clip-text text-transparent`}>
                        {message}
                    </h2>
                    <p className="text-muted-foreground text-lg">Your practice session is complete!</p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-4"
                >
                    <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                        <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.correct}</div>
                            <div className="text-xs text-muted-foreground">Correct</div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-red-500/10 to-pink-500/10">
                        <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-red-600 mb-1">{stats.incorrect}</div>
                            <div className="text-xs text-muted-foreground">Incorrect</div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{accuracy}%</div>
                            <div className="text-xs text-muted-foreground">Accuracy</div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-3 justify-center"
                >
                    <Button onClick={handleRestart} className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500">
                        <RotateCcw className="h-4 w-4" /> Try Again
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/mistakes')}>
                        Back to Mistakes
                    </Button>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.questionDetails.correctOption;

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/mistakes')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Question {currentIndex + 1} of {questions.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        (Mistake appeared {currentQuestion.mistakeCount}x)
                    </p>
                </div>
                <div className="w-20"></div>
            </div>

            {/* Progress Bar */}
            <motion.div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>

            {/* Question Card */}
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                <Card className="border-0 overflow-hidden">
                    <CardHeader className={`bg-gradient-to-r ${getDifficultyColor(currentQuestion.difficulty)} pb-6`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="secondary">{currentQuestion.topic}</Badge>
                                    <Badge className={`bg-gradient-to-r ${getDifficultyColor(currentQuestion.difficulty)} text-white border-0`}>
                                        {currentQuestion.difficulty.toUpperCase()}
                                    </Badge>
                                </div>
                                <CardTitle className="text-white text-lg leading-tight">
                                    {currentQuestion.questionDetails.text}
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-8 pb-8 space-y-6">
                        {/* Options */}
                        <div className="space-y-3">
                            {currentQuestion.questionDetails.options.map(option => {
                                const isSelected = selectedOption === option.id;
                                const isCorrectOption = option.id === currentQuestion.questionDetails.correctOption;
                                const showCorrect = showAnswer && isCorrectOption;
                                const showIncorrect = showAnswer && isSelected && !isCorrect;

                                return (
                                    <motion.button
                                        key={option.id}
                                        whileHover={!showAnswer ? { scale: 1.02 } : {}}
                                        whileTap={!showAnswer ? { scale: 0.98 } : {}}
                                        onClick={() => handleSelectOption(option.id)}
                                        disabled={showAnswer}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                            showCorrect
                                                ? 'bg-emerald-500/10 border-emerald-500 text-foreground'
                                                : showIncorrect
                                                  ? 'bg-red-500/10 border-red-500 text-foreground'
                                                  : isSelected && !showAnswer
                                                    ? 'bg-blue-500/10 border-blue-500 text-foreground'
                                                    : 'bg-muted/50 border-border text-muted-foreground hover:border-foreground/30'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                {showCorrect && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                        <span className="text-xs font-medium text-emerald-600">Correct Answer</span>
                                                    </div>
                                                )}
                                                {showIncorrect && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                                        <span className="text-xs font-medium text-red-600">Incorrect</span>
                                                    </div>
                                                )}
                                                <p className="text-sm font-medium">{option.text}</p>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Answer Details */}
                        {showAnswer && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 pt-6 border-t"
                            >
                                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                    <p className={`font-semibold text-sm mb-1 ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {isCorrect ? '✓ Excellent!' : '✗ Incorrect'}
                                    </p>
                                    <p className="text-sm">
                                        {isCorrect
                                            ? 'You got this one right! Great progress!'
                                            : `The correct answer is: ${getOptionText(currentQuestion.questionDetails.options, currentQuestion.questionDetails.correctOption)}`}
                                    </p>
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                                    <p className="font-medium text-xs text-muted-foreground mb-2">EXPLANATION</p>
                                    <p className="text-sm text-foreground">{currentQuestion.questionDetails.explanation}</p>
                                </div>

                                <Button onClick={handleNext} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500">
                                    {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'} <RotateCw className="ml-2 h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Stats Summary */}
            {showAnswer && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-3"
                >
                    <Card className="border-0 bg-emerald-500/10">
                        <CardContent className="pt-4 text-center">
                            <div className="text-2xl font-bold text-emerald-600">{stats.correct}</div>
                            <div className="text-xs text-muted-foreground">Correct</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-red-500/10">
                        <CardContent className="pt-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
                            <div className="text-xs text-muted-foreground">Incorrect</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-blue-500/10">
                        <CardContent className="pt-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.total > 0 ? Math.round(((stats.correct / stats.total) * 100)) : 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">Accuracy</div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default MistakePracticeMode;
