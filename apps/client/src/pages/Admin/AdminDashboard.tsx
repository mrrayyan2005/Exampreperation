import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchPlatformStats } from '../../redux/slices/adminSlice';
import {
    Users,
    UserPlus,
    Activity,
    ShieldCheck,
    AlertTriangle,
    Clock,
    Server,
    Database,
    Wifi,
    MessageSquareWarning,
    Shield,
    Zap,
    ArrowUpRight,
    Search,
    Filter,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const StatCard = ({ title, value, icon: Icon, description, isLoading }: any) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-1/2 mt-2" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );
};

const AdminDashboard = () => {
    const dispatch = useAppDispatch();
    const { stats, loading, error } = useAppSelector((state) => state.admin);

    const systemStatus = [
        { label: 'API Gateway', status: 'healthy', latency: '112ms', icon: Server },
        { label: 'Database', status: 'healthy', latency: '86ms', icon: Database },
        { label: 'Realtime', status: 'degraded', latency: '212ms', icon: Wifi },
        { label: 'Notifications', status: 'healthy', latency: '98ms', icon: Zap }
    ];

    const moderationQueue = [
        { id: 'RF-218', type: 'Note', reason: 'Copyright claim', status: 'Needs review', age: '2h' },
        { id: 'RF-219', type: 'Post', reason: 'Spam links', status: 'Urgent', age: '34m' },
        { id: 'RF-220', type: 'Comment', reason: 'Abusive language', status: 'Needs review', age: '1d' }
    ];

    const auditLog = [
        { actor: 'A. Sharma', action: 'Changed user role', target: 'priya.d', time: '5m ago' },
        { actor: 'System', action: 'Auto-locked account', target: 'rahul.k', time: '27m ago' },
        { actor: 'N. Verma', action: 'Approved content', target: 'note-8831', time: '1h ago' },
        { actor: 'A. Sharma', action: 'Reset password', target: 'neha.s', time: '3h ago' }
    ];

    const roleMatrix = [
        { role: 'Admin', users: stats?.roleDistribution?.admin || 0, scope: 'Full access' },
        { role: 'Moderator', users: stats?.roleDistribution?.moderator || 0, scope: 'Content + reports' },
        { role: 'Instructor', users: stats?.roleDistribution?.instructor || 0, scope: 'Course management' },
        { role: 'Student', users: stats?.roleDistribution?.student || 0, scope: 'Learner tools' }
    ];

    const recentUsers = [
        { name: 'Priya Desai', email: 'priya@domain.com', status: 'Active', plan: 'Pro', joined: 'Today' },
        { name: 'Rahul Kumar', email: 'rahul@domain.com', status: 'Pending', plan: 'Free', joined: '1d ago' },
        { name: 'Neha Singh', email: 'neha@domain.com', status: 'Active', plan: 'Team', joined: '2d ago' }
    ];

    useEffect(() => {
        dispatch(fetchPlatformStats());
    }, [dispatch]);

    if (error) {
        return (
            <div className="p-6 text-center text-destructive bg-destructive/10 rounded-lg">
                <ShieldCheck className="mx-auto h-10 w-10 mb-2" />
                <h2 className="text-lg font-semibold">Error Loading Statistics</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Command Center</h1>
                    <p className="text-muted-foreground">Monitor platform health, users, and content in one place.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Export Report
                    </Button>
                    <Button size="sm" className="gap-2" asChild>
                        <Link to="/admin/users">
                            <Users className="h-4 w-4" />
                            Manage Users
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    description="Total registered accounts"
                    isLoading={loading}
                />
                <StatCard
                    title="Recent Signups"
                    value={stats?.recentSignups || 0}
                    icon={UserPlus}
                    description="In the last 7 days"
                    isLoading={loading}
                />
                <StatCard
                    title="Active Users"
                    value={stats?.activeUsers || 0}
                    icon={Activity}
                    description="Logged in past 24h"
                    isLoading={loading}
                />
                <StatCard
                    title="Admins"
                    value={stats?.roleDistribution?.admin || 0}
                    icon={ShieldCheck}
                    description="Total users with admin role"
                    isLoading={loading}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            System Status
                        </CardTitle>
                        <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Live
                        </Badge>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                        {systemStatus.map((service) => {
                            const Icon = service.icon;
                            const statusTone = service.status === 'healthy'
                                ? 'text-emerald-600 bg-emerald-500/10'
                                : 'text-amber-600 bg-amber-500/10';
                            return (
                                <div key={service.label} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-full p-2 ${statusTone}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{service.label}</p>
                                            <p className="text-xs text-muted-foreground">Latency {service.latency}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={service.status === 'healthy' ? 'border-emerald-500/40 text-emerald-700' : 'border-amber-500/40 text-amber-700'}>
                                        {service.status}
                                    </Badge>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex items-center justify-between flex-row">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquareWarning className="h-5 w-5" />
                            Moderation Queue
                        </CardTitle>
                        <Button size="sm" variant="outline" asChild>
                            <Link to="/admin/content" className="gap-2">
                                View All
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {moderationQueue.map((item) => (
                            <div key={item.id} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">{item.type} {item.id}</p>
                                    <Badge variant={item.status === 'Urgent' ? 'destructive' : 'secondary'}>{item.status}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                                <p className="text-xs text-muted-foreground">Updated {item.age}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex items-center justify-between flex-row">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            User Management Snapshot
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="h-4 w-4 text-muted-foreground absolute left-2 top-2.5" />
                                <input
                                    className="h-9 w-40 rounded-md border bg-background pl-8 pr-2 text-sm"
                                    placeholder="Search users"
                                />
                            </div>
                            <Button size="sm" variant="outline">Filter</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentUsers.map((user) => (
                            <div key={user.email} className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline">{user.plan}</Badge>
                                    <Badge variant={user.status === 'Active' ? 'secondary' : 'outline'}>{user.status}</Badge>
                                    <span className="text-xs text-muted-foreground">{user.joined}</span>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Showing latest 3 users</span>
                            <Button size="sm" variant="ghost" asChild>
                                <Link to="/admin/users">Open full directory</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Roles & Permissions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {roleMatrix.map((role) => (
                            <div key={role.role} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{role.role}</span>
                                    <Badge variant="secondary">{role.users}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{role.scope}</p>
                            </div>
                        ))}
                        <Button size="sm" variant="outline" className="w-full">Edit Permissions</Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex items-center justify-between flex-row">
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            Audit Log
                        </CardTitle>
                        <Button size="sm" variant="outline">View All</Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {auditLog.map((item, index) => (
                            <div key={`${item.actor}-${index}`} className="flex items-start justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">{item.actor}</p>
                                    <p className="text-xs text-muted-foreground">{item.action} · {item.target}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">{item.time}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Risk Signals
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                                <p className="font-medium">Failed logins</p>
                                <Badge variant="destructive">High</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">18 attempts in last hour</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                                <p className="font-medium">API errors</p>
                                <Badge variant="outline">Normal</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">0.6% in last 24h</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                                <p className="font-medium">Content reports</p>
                                <Badge variant="secondary">Moderate</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">9 new reports today</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
