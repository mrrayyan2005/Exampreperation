import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { ArrowLeft, TrendingUp, Target, BookOpen, Zap, AlertCircle } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { toast } from '@/components/ui/use-toast';

interface AnalyticsData {
    byTopic: Array<{ topic: string; count: number; byDifficulty: { [key: string]: number } }>;
    byDifficulty: any;
    mostRepeated: Array<{ question: any; count: number }>;
    timeline: Array<{ date: string; count: number; analyzed: number }>;
    completion: { total: number; analyzed: number; percentage: number };
}

const MistakeAnalytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [byTopic, byDifficulty, mostRepeated, timeline, completion] = await Promise.all([
                axiosInstance.get('/tests/mistakes/analytics/by-topic'),
                axiosInstance.get('/tests/mistakes/analytics/by-difficulty'),
                axiosInstance.get('/tests/mistakes/analytics/most-repeated?limit=5'),
                axiosInstance.get('/tests/mistakes/analytics/timeline?days=30'),
                axiosInstance.get('/tests/mistakes/analytics/completion-rate')
            ]);

            setAnalytics({
                byTopic: byTopic.data.data,
                byDifficulty: byDifficulty.data.data,
                mostRepeated: mostRepeated.data.data,
                timeline: timeline.data.data,
                completion: completion.data.data
            });
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to load analytics', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="text-muted-foreground">Loading analytics...</div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <Button variant="ghost" onClick={() => navigate('/mistakes')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-lg font-medium">No analytics data available</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const difficultyColors = {
        easy: '#10b981',
        medium: '#f59e0b',
        hard: '#ef4444'
    };

    const pieData = [
        { name: 'Easy', value: analytics.byDifficulty.easy.count, color: '#10b981' },
        { name: 'Medium', value: analytics.byDifficulty.medium.count, color: '#f59e0b' },
        { name: 'Hard', value: analytics.byDifficulty.hard.count, color: '#ef4444' }
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mistake <span className="text-primary">Analytics</span></h1>
                    <p className="text-muted-foreground">Deep dive into your learning patterns</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/mistakes')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
            </div>

            {/* Key Stats */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <Card className="border-0 bg-gradient-to-br from-red-500/10 to-pink-500/10">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Mistakes</p>
                                    <p className="text-3xl font-bold text-red-600">{analytics.completion.total}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Analyzed</p>
                                    <p className="text-3xl font-bold text-blue-600">{analytics.completion.analyzed}</p>
                                </div>
                                <BookOpen className="h-8 w-8 text-blue-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Completion</p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                        {Math.round(analytics.completion.percentage)}%
                                    </p>
                                </div>
                                <Zap className="h-8 w-8 text-emerald-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                    <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Topics Covered</p>
                                    <p className="text-3xl font-bold text-purple-600">{analytics.byTopic.length}</p>
                                </div>
                                <Target className="h-8 w-8 text-purple-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Difficulty Distribution */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Mistakes by Difficulty</CardTitle>
                            <CardDescription>Distribution across difficulty levels</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                <div className="p-3 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/20">
                                    <p className="text-xs text-muted-foreground">Easy</p>
                                    <p className="text-2xl font-bold text-emerald-600">{analytics.byDifficulty.easy.count}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {Math.round(analytics.byDifficulty.easy.percentage)}%
                                    </p>
                                </div>
                                <div className="p-3 bg-amber-500/10 rounded-lg text-center border border-amber-500/20">
                                    <p className="text-xs text-muted-foreground">Medium</p>
                                    <p className="text-2xl font-bold text-amber-600">{analytics.byDifficulty.medium.count}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {Math.round(analytics.byDifficulty.medium.percentage)}%
                                    </p>
                                </div>
                                <div className="p-3 bg-red-500/10 rounded-lg text-center border border-red-500/20">
                                    <p className="text-xs text-muted-foreground">Hard</p>
                                    <p className="text-2xl font-bold text-red-600">{analytics.byDifficulty.hard.count}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {Math.round(analytics.byDifficulty.hard.percentage)}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Timeline */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>30-Day Trend</CardTitle>
                            <CardDescription>Mistakes over the past 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analytics.timeline}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--muted-foreground)"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#ef4444"
                                        name="Total Mistakes"
                                        strokeWidth={2}
                                        dot={{ fill: '#ef4444' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="analyzed"
                                        stroke="#10b981"
                                        name="Analyzed"
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Topics */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Mistakes by Topic</CardTitle>
                        <CardDescription>Count and difficulty breakdown for each topic</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={analytics.byTopic}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                    dataKey="topic"
                                    stroke="var(--muted-foreground)"
                                    style={{ fontSize: '12px' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                                <Legend />
                                <Bar dataKey="count" fill="#3b82f6" name="Total" />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Topic Details */}
                        <div className="mt-8 grid gap-3">
                            {analytics.byTopic.map((topic, idx) => (
                                <motion.div
                                    key={topic.topic}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="p-4 border rounded-lg bg-muted/30"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold">{topic.topic}</h4>
                                        <Badge variant="outline">{topic.count} mistakes</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 bg-emerald-500/10 rounded text-center text-sm">
                                            <div className="text-emerald-600 font-semibold">{topic.byDifficulty.easy || 0}</div>
                                            <div className="text-xs text-muted-foreground">Easy</div>
                                        </div>
                                        <div className="p-2 bg-amber-500/10 rounded text-center text-sm">
                                            <div className="text-amber-600 font-semibold">{topic.byDifficulty.medium || 0}</div>
                                            <div className="text-xs text-muted-foreground">Medium</div>
                                        </div>
                                        <div className="p-2 bg-red-500/10 rounded text-center text-sm">
                                            <div className="text-red-600 font-semibold">{topic.byDifficulty.hard || 0}</div>
                                            <div className="text-xs text-muted-foreground">Hard</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Most Repeated Mistakes */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Most Repeated Mistakes</CardTitle>
                        <CardDescription>Questions you struggle with the most</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.mostRepeated.map((item, idx) => (
                                <motion.div
                                    key={item.question._id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="p-4 border rounded-lg bg-red-500/5 border-red-500/20 hover:border-red-500/40 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm line-clamp-2">{item.question.text}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {item.question.topic}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${
                                                        item.question.difficulty === 'easy'
                                                            ? 'border-emerald-500/30 text-emerald-600'
                                                            : item.question.difficulty === 'medium'
                                                              ? 'border-amber-500/30 text-amber-600'
                                                              : 'border-red-500/30 text-red-600'
                                                    }`}
                                                >
                                                    {item.question.difficulty}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                            <div className="text-2xl font-bold text-red-600">{item.count}</div>
                                            <div className="text-xs text-muted-foreground">times</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default MistakeAnalytics;
