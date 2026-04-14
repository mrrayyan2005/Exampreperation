import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} = Recharts as any;
const LineChartAny = LineChart;
const LineAny = Line;
const BarChartAny = BarChart;
const BarAny = Bar;
const XAxisAny = XAxis;
const YAxisAny = YAxis;
const CartesianGridAny = CartesianGrid;
const TooltipAny = Tooltip;
const LegendAny = Legend;
const ResponsiveContainerAny = ResponsiveContainer;
const PieChartAny = PieChart;
const PieAny = Pie;
const CellAny = Cell;
import { TrendingUp, Award, AlertTriangle, Users } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';

const ProgressDashboard = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const [math, reading] = await Promise.all([
                axiosInstance.get('/analytics/history/Math'),
                axiosInstance.get('/analytics/history/Reading')
            ]);

            // Merge and format for chart
            const merged = math.data.data.map((m: any, idx: number) => ({
                window: m.benchmarkWindow,
                Math: m.score,
                Reading: reading.data.data[idx]?.score || 0
            }));

            setHistory(merged);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    const latest = history[history.length - 1] || {};

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Progress <span className="text-primary">Dashboard</span></h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="text-blue-500" />
                            <span className="text-sm font-medium">Math Scaled Score</span>
                        </div>
                        <div className="text-2xl font-bold">{latest.Math || '---'}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="text-purple-500" />
                            <span className="text-sm font-medium">Reading Scaled Score</span>
                        </div>
                        <div className="text-2xl font-bold">{latest.Reading || '---'}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="p-4">
                <CardHeader>
                    <CardTitle>Seasonal Benchmarking Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainerAny width="100%" height="100%">
                            <LineChartAny data={history}>
                                <CartesianGridAny strokeDasharray="3 3" />
                                <XAxisAny dataKey="window" />
                                <YAxisAny domain={[200, 800]} />
                                <TooltipAny />
                                <LegendAny />
                                <LineAny type="monotone" dataKey="Math" stroke="#3b82f6" strokeWidth={2} />
                                <LineAny type="monotone" dataKey="Reading" stroke="#a855f7" strokeWidth={2} />
                            </LineChartAny>
                        </ResponsiveContainerAny>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProgressDashboard;
