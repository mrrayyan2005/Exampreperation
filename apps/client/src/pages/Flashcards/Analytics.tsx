import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import flashcardApi, { Deck, DeckStats, UserAnalytics } from '@/api/flashcardApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as Recharts from 'recharts';
const {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} = Recharts as any;
const LineChartAny = LineChart;
const LineAny = Line;
const BarChartAny = BarChart;
const BarAny = Bar;
const XAxisAny = XAxis;
const YAxisAny = YAxis;
const CartesianGridAny = CartesianGrid;
const TooltipAny = Tooltip;
const ResponsiveContainerAny = ResponsiveContainer;
import { ArrowLeft, TrendingUp, CalendarCheck, Target, BookOpen } from 'lucide-react';

const FlashcardsAnalytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [deckStats, setDeckStats] = useState<Record<string, DeckStats>>({});

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [analyticsData, deckData] = await Promise.all([
                flashcardApi.getUserAnalytics(),
                flashcardApi.getDecks()
            ]);
            setAnalytics(analyticsData);
            setDecks(deckData);

            const statsEntries = await Promise.all(
                deckData.map(async (deck) => {
                    const stats = await flashcardApi.getDeckStats(deck._id);
                    return [deck._id, stats] as const;
                })
            );
            setDeckStats(Object.fromEntries(statsEntries));
        } catch (error) {
            console.error('Failed to load flashcard analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex h-[60vh] items-center justify-center">Loading analytics...</div>;
    }

    if (!analytics) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
                <p className="text-lg font-semibold">Analytics unavailable.</p>
                <Button onClick={() => navigate('/flashcards')}>Back to decks</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <Button variant="ghost" onClick={() => navigate('/flashcards')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to decks
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Flashcards Analytics</h1>
                    <p className="text-muted-foreground">Track review volume, accuracy, and streaks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="text-blue-500" />
                            <span className="text-sm font-medium">Total Decks</span>
                        </div>
                        <div className="text-2xl font-bold">{analytics.deckCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="text-indigo-500" />
                            <span className="text-sm font-medium">Total Cards</span>
                        </div>
                        <div className="text-2xl font-bold">{analytics.totalCards}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <CalendarCheck className="text-orange-500" />
                            <span className="text-sm font-medium">Due Cards</span>
                        </div>
                        <div className="text-2xl font-bold">{analytics.dueCards}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="text-emerald-500" />
                            <span className="text-sm font-medium">Accuracy</span>
                        </div>
                        <div className="text-2xl font-bold">{analytics.accuracyRate}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="text-purple-500" />
                            <span className="text-sm font-medium">Current Streak</span>
                        </div>
                        <div className="text-2xl font-bold">{analytics.streakDays} days</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                    <CardHeader>
                        <CardTitle>Review Volume (30 days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainerAny width="100%" height="100%">
                                <LineChartAny data={analytics.reviewTrend}>
                                    <CartesianGridAny strokeDasharray="3 3" />
                                    <XAxisAny dataKey="date" hide />
                                    <YAxisAny allowDecimals={false} />
                                    <TooltipAny />
                                    <LineAny type="monotone" dataKey="reviews" stroke="#3b82f6" strokeWidth={2} />
                                </LineChartAny>
                            </ResponsiveContainerAny>
                        </div>
                    </CardContent>
                </Card>
                <Card className="p-4">
                    <CardHeader>
                        <CardTitle>Accuracy Trend (30 days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainerAny width="100%" height="100%">
                                <BarChartAny data={analytics.reviewTrend}>
                                    <CartesianGridAny strokeDasharray="3 3" />
                                    <XAxisAny dataKey="date" hide />
                                    <YAxisAny domain={[0, 100]} />
                                    <TooltipAny />
                                    <BarAny dataKey="accuracy" fill="#10b981" />
                                </BarChartAny>
                            </ResponsiveContainerAny>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deck Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    {decks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No decks to analyze yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {decks.map((deck) => {
                                const stats = deckStats[deck._id];
                                return (
                                    <div key={deck._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                                        <div>
                                            <p className="font-medium">{deck.name}</p>
                                            <p className="text-xs text-muted-foreground">{deck.topic}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <span>Total: {stats?.totalCards ?? deck.stats?.totalCards ?? 0}</span>
                                            <span>Due: {stats?.dueCards ?? 0}</span>
                                            <span>Learned: {stats?.learnedCards ?? 0}</span>
                                            <span>Accuracy: {stats?.accuracyRate ?? 0}%</span>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => navigate(`/flashcards/${deck._id}/edit`)}>
                                            Manage
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FlashcardsAnalytics;
