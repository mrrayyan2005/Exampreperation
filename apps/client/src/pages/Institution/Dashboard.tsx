import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Plus, Building2, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';

import { institutionService } from '@/api/institutionService';
import { BulkUploadModal } from '@/components/institution/BulkUploadModal';

const InstitutionDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        totalStudents: 0,
        activeStudents: 0,
        averageProgress: 0
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await institutionService.getStudents();
            setStudents(data.data || []);
            setStats(prev => ({ ...prev, totalStudents: data.count || 0 }));
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'institution_admin') {
            fetchData();
        }
    }, [user]);

    if (user?.role !== 'institution_admin') {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p>You must be an institution administrator to view this page.</p>
                <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                    Go to Student Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Institution Dashboard
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                        Manage your students and viewing analytics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <BulkUploadModal onSuccess={fetchData} />
                    <Button onClick={() => navigate('/institution/students/add')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/institution/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents.toString()}
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    title="Active (Last 7 Days)"
                    value={stats.activeStudents.toString()}
                    icon={TrendingUp}
                    color="success"
                />
                <StatCard
                    title="Avg. Progress"
                    value={`${stats.averageProgress}%`}
                    icon={Building2}
                    color="accent"
                />
            </div>

            {/* Quick Actions / Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading students...
                            </div>
                        ) : students.length > 0 ? (
                            <div className="space-y-2">
                                {students.map((student: any) => (
                                    <div key={student._id} className="flex items-center justify-between p-2 border rounded">
                                        <div>
                                            <div className="font-medium">{student.name}</div>
                                            <div className="text-sm text-muted-foreground">{student.email}</div>
                                        </div>
                                        <Badge variant="outline">{student.examTypes?.join(', ') || 'General'}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No students found. Upload CSV to add students.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InstitutionDashboard;
