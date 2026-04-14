import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../../redux/slices/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Mail, Calendar, Shield, MapPin, Award } from 'lucide-react';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchAdminUsers } from '../../redux/slices/adminSlice';

interface ExtendedUser extends User {
    studyPreferences?: {
        dailyStudyHours?: number;
        breakDuration?: number;
    };
    progressStats?: {
        totalStudyHours?: number;
        currentStreak?: number;
        longestStreak?: number;
        totalGoalsCompleted?: number;
        lastStudyDate?: string;
    };
    targetScore?: number;
    isEmailVerified?: boolean;
    isTwoFactorEnabled?: boolean;
    notifications?: {
        email?: boolean;
        dailyReminder?: boolean;
        weeklyReport?: boolean;
    };
}

const UserProfileView = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { users } = useAppSelector((state) => state.admin);
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the user from the list or API
        setLoading(true);
        // First check if user is already in the list
        const foundUser = users.find(u => u.id === userId);
        if (foundUser) {
            setUser(foundUser);
            setLoading(false);
        } else {
            // Fetch all users to find this one
            dispatch(fetchAdminUsers({ page: 1, limit: 100, search: '' })).then(() => {
                setLoading(false);
            });
        }
    }, [userId, dispatch, users]);

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-500/10 text-purple-500 border-purple-200';
            case 'teacher': return 'bg-blue-500/10 text-blue-500 border-blue-200';
            case 'student': return 'bg-slate-500/10 text-slate-500 border-slate-200';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Button variant="outline" onClick={() => navigate('/admin/users')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Users
                </Button>
                <div className="text-center py-10">Loading user profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="space-y-6">
                <Button variant="outline" onClick={() => navigate('/admin/users')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Users
                </Button>
                <div className="text-center py-10 text-destructive">User not found</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => navigate('/admin/users')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Users
                </Button>
                <h1 className="text-3xl font-bold">User Profile</h1>
                <div /> {/* Spacer for flex alignment */}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Profile Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-2xl">{user.name}</CardTitle>
                                <p className="text-muted-foreground mt-1">{user.email}</p>
                            </div>
                            <Badge className={`${getRoleBadgeColor(user.role)}`}>
                                {user.role}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Email</label>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Member Since</label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'Unknown'}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Status</label>
                                <Badge variant="outline" className={user.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-200' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Role</label>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <span className="capitalize">{user.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Study Preferences */}
                        {(user as any).studyPreferences && (
                            <div className="space-y-4 border-t pt-4">
                                <h4 className="font-semibold">Study Preferences</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm text-muted-foreground">Daily Study Hours</label>
                                        <p className="font-medium">{(user as any).studyPreferences.dailyStudyHours || 0} hours</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Break Duration</label>
                                        <p className="font-medium">{(user as any).studyPreferences.breakDuration || 0} minutes</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Progress Stats */}
                        {(user as any).progressStats && (
                            <div className="space-y-4 border-t pt-4">
                                <h4 className="font-semibold">Progress Statistics</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm text-muted-foreground">Total Study Hours</label>
                                        <p className="text-2xl font-bold">{(user as any).progressStats.totalStudyHours || 0}h</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Current Streak</label>
                                        <p className="text-2xl font-bold">{(user as any).progressStats.currentStreak || 0} days</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Longest Streak</label>
                                        <p className="text-2xl font-bold">{(user as any).progressStats.longestStreak || 0} days</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Goals Completed</label>
                                        <p className="text-2xl font-bold">{(user as any).progressStats.totalGoalsCompleted || 0}</p>
                                    </div>
                                </div>
                                {(user as any).progressStats.lastStudyDate && (
                                    <div>
                                        <label className="text-sm text-muted-foreground">Last Study Date</label>
                                        <p className="font-medium">{format(new Date((user as any).progressStats.lastStudyDate), 'PPP')}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Exam Info */}
                        {user.examTypes && (
                            <div className="space-y-4 border-t pt-4">
                                <h4 className="font-semibold">Exam Information</h4>
                                <div className="grid gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground">Exam Types</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {user.examTypes.map((exam) => (
                                                <Badge key={exam} variant="secondary">{exam}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    {user.examDate && (
                                        <div>
                                            <label className="text-sm text-muted-foreground">Exam Date</label>
                                            <p className="font-medium">{format(new Date(user.examDate), 'PPP')}</p>
                                        </div>
                                    )}
                                    {user.targetScore && (
                                        <div>
                                            <label className="text-sm text-muted-foreground">Target Score</label>
                                            <p className="font-medium">{user.targetScore}%</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Side Info */}
                <div className="space-y-6">
                    {/* Email Verification */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Email Verification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge className={user.isEmailVerified ? 'bg-emerald-500/10 text-emerald-500 border-emerald-200' : 'bg-amber-500/10 text-amber-500 border-amber-200'}>
                                {user.isEmailVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Security</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Two-Factor Auth</span>
                                <Badge variant="outline" className={user.isTwoFactorEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}>
                                    {user.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    {user.notifications && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notifications</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Email</span>
                                    <Badge variant="outline" className={user.notifications.email ? 'bg-emerald-500/10' : 'bg-gray-500/10'}>
                                        {user.notifications.email ? 'On' : 'Off'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Daily Reminder</span>
                                    <Badge variant="outline" className={user.notifications.dailyReminder ? 'bg-emerald-500/10' : 'bg-gray-500/10'}>
                                        {user.notifications.dailyReminder ? 'On' : 'Off'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Weekly Report</span>
                                    <Badge variant="outline" className={user.notifications.weeklyReport ? 'bg-emerald-500/10' : 'bg-gray-500/10'}>
                                        {user.notifications.weeklyReport ? 'On' : 'Off'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;
