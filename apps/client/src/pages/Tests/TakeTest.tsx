import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testApi, { Test } from '@/api/testApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";

const TakeTest = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [test, setTest] = useState<Test | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0); // seconds
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (testId) fetchTest();
    }, [testId]);

    // Timer Logic
    useEffect(() => {
        if (!test || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, test]);

    const fetchTest = async () => {
        try {
            const data = await testApi.getTest(testId!);
            setTest(data);
            setTimeLeft(data.duration * 60);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load test'
            });
            navigate('/tests');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (optionId: string) => {
        const currentQ = test?.questions[currentQuestionIndex];
        if (currentQ) {
            setAnswers(prev => ({
                ...prev,
                [currentQ._id]: optionId
            }));
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            // Format answers for backend
            const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
                questionId: qId,
                selectedOption: optId as string,
                timeSpent: 0 // Track per question time logic could be added later
            }));

            // Submit attempt
            await testApi.submitAttempt(testId!, formattedAnswers);

            toast({
                title: 'Test Submitted!',
                description: 'Your responses have been recorded.'
            });
            navigate('/tests'); // Or to a result page
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Submission Error',
                description: 'Could not submit test.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading Test...</div>;
    if (!test) return <div>Test not found</div>;

    const currentQuestion = test.questions[currentQuestionIndex];
    if (!currentQuestion) return <div>No Questions</div>;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Main Question Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{test.title}</h2>
                    <div className={`flex items-center gap-2 rounded-md px-3 py-1 font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-muted'}`}>
                        <Clock className="h-5 w-5" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <Card className="min-h-[400px]">
                    <CardHeader>
                        <CardTitle className="flex gap-4 text-lg">
                            <span className="text-muted-foreground">Q.{currentQuestionIndex + 1}</span>
                            {currentQuestion.text}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={answers[currentQuestion._id] || ''}
                            onValueChange={handleAnswerSelect}
                            className="space-y-4"
                        >
                            {currentQuestion.options.map((opt) => (
                                <div key={opt._id} className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                    <RadioGroupItem value={opt._id} id={opt._id} />
                                    <Label htmlFor={opt._id} className="flex-1 cursor-pointer font-normal">{opt.text}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>

                <div className="mt-6 flex justify-between">
                    <Button
                        variant="outline"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    >
                        Previous
                    </Button>

                    {currentQuestionIndex < test.questions.length - 1 ? (
                        <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                            Next Question
                        </Button>
                    ) : (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Test'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Sidebar Question Palette */}
            <div className="hidden w-80 flex-col border-l bg-muted/10 md:flex">
                <div className="border-b p-4">
                    <h3 className="font-semibold">Question Palette</h3>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Answered: {Object.keys(answers).length}</span>
                        <span>Remaining: {test.questions.length - Object.keys(answers).length}</span>
                    </div>
                    <Progress value={(Object.keys(answers).length / test.questions.length) * 100} className="mt-2 h-2" />
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="grid grid-cols-4 gap-2">
                        {test.questions.map((q, idx) => (
                            <button
                                key={q._id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors 
                                    ${idx === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-2' : ''}
                                    ${answers[q._id] ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
                                `}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </ScrollArea>

                <div className="mt-auto border-t p-4">
                    <Button variant="destructive" className="w-full" onClick={handleSubmit} disabled={submitting}>
                        End Test
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TakeTest;
