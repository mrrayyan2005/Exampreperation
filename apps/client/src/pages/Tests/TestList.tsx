import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import testApi, { Test } from '@/api/testApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckSquare, Award } from 'lucide-react';

const TestList = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [testsData, attemptsData] = await Promise.all([
                    testApi.getTests(),
                    testApi.getMyAttempts()
                ]);
                setTests(testsData.tests);
                setAttempts(attemptsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mock <span className="text-primary">Tests</span></h1>
                <p className="text-muted-foreground">Simulate exam day with timed full-length and sectional tests.</p>
            </div>

            <section>
                <h2 className="mb-4 text-xl font-semibold">Available Tests</h2>
                {loading ? (
                    <div>Loading tests...</div>
                ) : tests.length === 0 ? (
                    <p className="text-muted-foreground">No tests available at the moment. Check back later!</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {tests.map(test => (
                            <Card key={test._id}>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <Badge variant={test.type === 'MOCK' ? 'default' : 'secondary'}>{test.type}</Badge>
                                            {(test as any).isAdaptive && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Adaptive</Badge>}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="mr-1 h-4 w-4" /> {test.duration} min
                                        </div>
                                    </div>
                                    <CardTitle className="mt-2">{test.title}</CardTitle>
                                    <CardDescription>{test.questionsCount || test.questions.length} Questions • {test.totalMarks} Marks</CardDescription>
                                </CardHeader>
                                <CardFooter className="flex flex-col gap-2">
                                    {(test as any).isAdaptive ? (
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate(`/tests/${test._id}/adaptive`)}>
                                            Start Adaptive Assessment
                                        </Button>
                                    ) : (
                                        <Button className="w-full" onClick={() => navigate(`/tests/${test._id}/take`)}>
                                            Start Test
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="mb-4 text-xl font-semibold">Recent Attempts</h2>
                {attempts.length === 0 ? (
                    <p className="text-muted-foreground">No attempts yet.</p>
                ) : (
                    <div className="space-y-4">
                        {attempts.map(attempt => (
                            <Card key={attempt._id} className="flex items-center justify-between p-4">
                                <div>
                                    <h4 className="font-semibold">{attempt.test?.title || 'Unknown Test'}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Score: {attempt.score}/{attempt.maxScore} • Accuracy: {Math.round(attempt.accuracy)}%
                                    </p>
                                </div>
                                <Badge variant={attempt.status === 'COMPLETED' ? 'outline' : 'default'}>
                                    {attempt.status}
                                </Badge>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default TestList;
