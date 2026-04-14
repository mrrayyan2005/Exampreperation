import { useState, useEffect, useMemo } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Calendar, 
    Target, 
    FileText, 
    Tags, 
    Clock,
    Flame,
    Award,
    Activity,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';

// Simple chart components
function BarChart({ data, maxValue }: { data: number[]; maxValue: number }) {
    return (
        <div className="flex items-end gap-1 h-24">
            {data.map((value, i) => (
                <div
                    key={i}
                    className="flex-1 bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                    style={{ height: `${(value / maxValue) * 100}%` }}
                    title={`${value} notes`}
                />
            ))}
        </div>
    );
}

function LineChart({ data }: { data: number[] }) {
    const max = Math.max(...data, 1);
    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (value / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-32" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                points={points}
            />
            <polygon
                fill="hsl(var(--primary))"
                fillOpacity="0.1"
                points={`0,100 ${points} 100,100`}
            />
        </svg>
    );
}

interface NoteStats {
    totalNotes: number;
    totalWords: number;
    totalCharacters: number;
    averageWordsPerNote: number;
    notesThisWeek: number;
    notesThisMonth: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    tagsDistribution: Array<{ name: string; count: number }>;
    dailyActivity: Array<{ date: string; count: number }>;
    monthlyActivity: Array<{ month: string; count: number }>;
    mostProductiveDay: string;
    mostProductiveHour: number;
}

interface StatisticsDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StatisticsDashboard({ isOpen, onClose }: StatisticsDashboardProps) {
    const [stats, setStats] = useState<NoteStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSection, setExpandedSection] = useState<string | null>('overview');

    useEffect(() => {
        if (isOpen) {
            fetchStats();
        }
    }, [isOpen]);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/notes/statistics');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
            toast.error('Failed to load statistics');
        } finally {
            setIsLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    const getStreakEmoji = (streak: number) => {
        if (streak >= 30) return '🔥';
        if (streak >= 14) return '⚡';
        if (streak >= 7) return '💪';
        if (streak >= 3) return '✨';
        return '🌱';
    };

    const getStreakMessage = (streak: number) => {
        if (streak >= 30) return 'Unstoppable! Keep it up!';
        if (streak >= 14) return 'Amazing consistency!';
        if (streak >= 7) return 'Great week streak!';
        if (streak >= 3) return 'Building momentum!';
        if (streak > 0) return 'Good start!';
        return 'Start your streak today!';
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        <div>
                            <h2 className="text-xl font-bold">Study Insights</h2>
                            <p className="text-sm text-muted-foreground">
                                Track your learning journey
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        ✕
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            </div>
                        ) : !stats ? (
                            <div className="text-center text-muted-foreground py-12">
                                No statistics available yet. Start taking notes!
                            </div>
                        ) : (
                            <>
                                {/* Streak Card */}
                                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="text-4xl">{getStreakEmoji(stats.currentStreak)}</div>
                                                <div>
                                                    <div className="text-3xl font-bold">
                                                        {stats.currentStreak} Day Streak
                                                    </div>
                                                    <p className="text-muted-foreground">
                                                        {getStreakMessage(stats.currentStreak)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-muted-foreground">Longest Streak</div>
                                                <div className="text-xl font-semibold flex items-center gap-1">
                                                    <Award className="h-5 w-5 text-yellow-500" />
                                                    {stats.longestStreak} days
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="text-xs">Total Notes</span>
                                            </div>
                                            <div className="text-2xl font-bold">{formatNumber(stats.totalNotes)}</div>
                                            <div className="text-xs text-green-500 flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                +{stats.notesThisWeek} this week
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                                <Activity className="h-4 w-4" />
                                                <span className="text-xs">Total Words</span>
                                            </div>
                                            <div className="text-2xl font-bold">{formatNumber(stats.totalWords)}</div>
                                            <div className="text-xs text-muted-foreground">
                                                ~{stats.averageWordsPerNote} per note
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                                <Tags className="h-4 w-4" />
                                                <span className="text-xs">Active Tags</span>
                                            </div>
                                            <div className="text-2xl font-bold">{stats.tagsDistribution.length}</div>
                                            <div className="text-xs text-muted-foreground">
                                                organizing your notes
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                                <Target className="h-4 w-4" />
                                                <span className="text-xs">This Month</span>
                                            </div>
                                            <div className="text-2xl font-bold">{stats.notesThisMonth}</div>
                                            <div className="text-xs text-muted-foreground">
                                                notes created
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Activity Charts */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Activity Over Time
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {stats.monthlyActivity.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    {stats.monthlyActivity.slice(-6).map((m, i) => (
                                                        <span key={i}>{m.month}</span>
                                                    ))}
                                                </div>
                                                <BarChart 
                                                    data={stats.monthlyActivity.slice(-6).map(m => m.count)}
                                                    maxValue={Math.max(...stats.monthlyActivity.map(m => m.count), 1)}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Daily Activity Heatmap */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Last 30 Days
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-7 gap-1">
                                            {Array.from({ length: 30 }, (_, i) => {
                                                const date = new Date();
                                                date.setDate(date.getDate() - (29 - i));
                                                const dateStr = date.toISOString().split('T')[0];
                                                const activity = stats.dailyActivity.find(d => d.date === dateStr);
                                                const count = activity?.count || 0;
                                                const intensity = Math.min(count / 3, 1);
                                                
                                                return (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "aspect-square rounded-sm transition-all",
                                                            count === 0 ? "bg-muted" : "bg-primary"
                                                        )}
                                                        style={{
                                                            opacity: count === 0 ? 0.3 : 0.3 + intensity * 0.7
                                                        }}
                                                        title={`${date.toLocaleDateString()}: ${count} notes`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                            <span>30 days ago</span>
                                            <span>Today</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Tag Distribution */}
                                {stats.tagsDistribution.length > 0 && (
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                <Tags className="h-4 w-4" />
                                                Top Tags
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {stats.tagsDistribution.slice(0, 5).map((tag, i) => {
                                                    const maxCount = stats.tagsDistribution[0].count;
                                                    const percentage = (tag.count / maxCount) * 100;
                                                    
                                                    return (
                                                        <div key={tag.name} className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span>#{tag.name}</span>
                                                                <span className="text-muted-foreground">{tag.count}</span>
                                                            </div>
                                                            <Progress value={percentage} className="h-2" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Productivity Insights */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Productivity Insights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground">Most Productive Day</div>
                                                <div className="text-lg font-semibold flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    {stats.mostProductiveDay || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground">Peak Hour</div>
                                                <div className="text-lg font-semibold flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    {stats.mostProductiveHour !== undefined 
                                                        ? `${stats.mostProductiveHour}:00` 
                                                        : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 border-t bg-muted/50 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchStats}>
                        Refresh
                    </Button>
                </div>
            </div>
        </div>
    );
}