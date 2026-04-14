import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { Badge } from '@/components/ui/badge';

const StudentGrouping = () => {
    const [groups, setGroups] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await axiosInstance.get('/analytics/suggested-groups?domain=Math');
            setGroups(response.data.data);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        } finally {
            setLoading(false);
        }
    };

    const getGroupIcon = (name: string) => {
        if (name === 'Intensive Instruction') return <AlertCircle className="text-red-500" />;
        if (name === 'Targeted Intervention') return <AlertCircle className="text-orange-500" />;
        return <CheckCircle className="text-green-500" />;
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Instructional <span className="text-primary">Grouping</span></h1>
            <p className="text-muted-foreground">Groups automatically formed based on recent assessment data.</p>

            {loading ? (
                <div>Loading groups...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(groups).map(([name, students]) => (
                        <Card key={name}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    {getGroupIcon(name)}
                                    {name}
                                </CardTitle>
                                <Badge variant="secondary">{(students as any[]).length} Students</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        {name === 'Intensive Instruction' ? 'Requires immediate intervention and foundational support.' :
                                            name === 'Advanced' ? 'Students ready for enrichment and higher-level challenges.' :
                                                'Students meeting or approaching grade level standards.'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(students as any[]).length > 0 ? (students as any[]).map((s, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-xs">
                                                <Users size={12} />
                                                Student {idx + 1}
                                            </div>
                                        )) : <p className="text-xs italic">No students in this category.</p>}
                                    </div>
                                    <Button size="sm" variant="outline" className="w-full mt-4">Create Small Group Plan</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentGrouping;
