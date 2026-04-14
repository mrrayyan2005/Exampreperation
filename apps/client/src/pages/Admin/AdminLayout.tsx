import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, ArrowUpRight } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useRedux';
import { logout } from '../../redux/slices/authSlice';
import { cn } from '../../lib/utils';

const AdminLayout = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { label: 'Users', icon: Users, path: '/admin/users' },
        { label: 'Content Management', icon: Settings, path: '/admin/content' },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground">

            {/* Sidebar - Fixed */}
            <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-card flex flex-col hidden md:flex z-40">
                <div className="h-16 flex items-center px-6 border-b">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t space-y-4">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium border rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        Back to App
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 md:ml-64">
                <header className="h-16 border-b bg-background flex items-center justify-between px-6">
                    <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
                    >
                        Go to Dashboard
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </header>

                <div className="flex-1 overflow-auto p-6 md:p-8">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default AdminLayout;
