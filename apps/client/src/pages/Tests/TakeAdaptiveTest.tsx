import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testApi, { Question } from '@/api/testApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TakeAdaptiveTest = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [previousAnswers, setPreviousAnswers] = useState<any[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [currentScore, setCurrentScore] = useState(200);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (testId) fetchNextQuestion([]);
    }, [testId]);

    const fetchNextQuestion = async (history: any[], lastAns: any = null) => {
        setLoading(true);
        try {
            const result = await testApi.getNextAdaptiveQuestion(testId!, history, lastAns);
            setCurrentQuestion(result.question);
            setCurrentScore(result.currentScaledScore);
            setPreviousAnswers(result.history || []);
            setSelectedOption(null);
        } catch (error: any) {
            if (error.response?.status === 404) {
                setIsFinished(true);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load next question' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSubmit = async () => {
        if (!selectedOption || !currentQuestion || submitting) return;

        setSubmitting(true);
        try {
            const lastAns = {
                questionId: currentQuestion._id,
                selectedOption: selectedOption
            };

            // Limit to 20 questions for the adaptive test
            if (previousAnswers.length >= 19) {
                // Submit final attempt
                await testApi.submitAdaptiveAttempt(testId!, [...previousAnswers, {
                    ...lastAns,
                    isCorrect: true, // Backend will re-evaluate, but we send it for completeness
                    difficulty: (currentQuestion as any).difficulty
                }]);
                setIsFinished(true);
            } else {
                await fetchNextQuestion(previousAnswers, lastAns);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit answer' });
        } finally {
            setSubmitting(false);
        }
    };

    // [BACKTRACK] I need the backend to validate the answer.
    // I'll update testService.js to include an 'evaluateAnswer' or similar.
    // Or I'll just have getNextAdaptiveQuestion take the selected option and validate it.

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Adaptive Assessment</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        <TrendingUp size={16} />
                        Scaled Score: {currentScore}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">Loading...</div>
            ) : currentQuestion ? (
                <Card>
                    <CardHeader>
                        <CardTitle>{currentQuestion.text}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={selectedOption || ''} onValueChange={setSelectedOption}>
                            {currentQuestion.options.map((opt) => (
                                <div key={opt._id} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-muted/50">
                                    <RadioGroupItem value={opt._id} id={opt._id} />
                                    <Label htmlFor={opt._id} className="flex-1 cursor-pointer">{opt.text}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        <Button
                            className="mt-6 w-full"
                            disabled={!selectedOption || submitting}
                            onClick={handleAnswerSubmit}
                        >
                            {submitting ? 'Submitting...' : 'Submit Answer'}
                        </Button>
                    </CardContent>
                </Card>
            ) : isFinished ? (
                <Card className="text-center p-10">
                    <TrendingUp className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
                    <p className="text-muted-foreground mb-6">Final Scaled Score: {currentScore}</p>
                    <Button onClick={() => navigate('/tests')}>Back to Tests</Button>
                </Card>
            ) : null}
        </div>
    );
};

export default TakeAdaptiveTest;
