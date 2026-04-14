import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen } from 'lucide-react';

interface DailyLog {
    subject: string;
    totalMinutes: number;
}

interface DailyProgressWidgetProps {
    logs: DailyLog[];
    dailyGoalHours: number;
}

const DailyProgressWidget: React.FC<DailyProgressWidgetProps> = ({ logs, dailyGoalHours }) => {
    const totalMinutes = logs.reduce((sum, log) => sum + log.totalMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const goalMinutes = dailyGoalHours * 60;
    const overallProgress = Math.min(Math.round((totalMinutes / goalMinutes) * 100), 100);

    return (
        <Card className="bg-white border-gray-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Today's Progress
                    </span>
                    <span className="text-gray-500 font-normal">
                        {totalHours}h / {dailyGoalHours}h Goal
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Overall</span>
                            <span className="font-medium">{overallProgress}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            By Subject
                        </h4>
                        {logs.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-2 text-center">
                                No study time logged yet today
                            </p>
                        ) : (
                            logs.map((log) => (
                                <div key={log.subject} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <BookOpen className="h-3 w-3 text-gray-400" />
                                        <span className="truncate max-w-[120px]">{log.subject}</span>
                                    </div>
                                    <span className="font-mono text-gray-600">
                                        {(log.totalMinutes / 60).toFixed(1)}h
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyProgressWidget;
