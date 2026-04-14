import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Target, Calendar, Clock, FileText, Layers, AlertOctagon, User, LogOut, LayoutDashboard, Palette } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState, useEffect, ComponentType } from 'react';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';
import { DashboardThemeSelector } from '@/themes/DashboardThemeSelector';
import { SmartAvatar } from '@/components/ui/SmartAvatar';

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

// Simplified navigation - only essential features
const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Calendar, label: 'Monthly Plan', path: '/monthly-plan' },
  { icon: Target, label: 'Daily Goals', path: '/daily-goals' },
  { icon: Clock, label: 'Study Sessions', path: '/study-sessions' },
  { icon: BookOpen, label: 'Subjects', path: '/subjects' },
  { icon: FileText, label: 'Study Notes', path: '/notes' },
  { icon: Layers, label: 'Flashcards', path: '/flashcards' },
  { icon: AlertOctagon, label: 'Mistake Notebook', path: '/mistakes' },
];

const Sidebar = ({ mobile = false, onNavigate }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    onNavigate?.();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  interface NavItem {
    icon: ComponentType<{ className?: string }>;
    label: string;
    path: string;
  }

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
    
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end
        onClick={() => mobile && onNavigate?.()}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <>
          {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
          )}
          <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
          {item.label}
        </>
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-50 w-64 h-screen bg-background border-r shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b relative z-10 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-md text-primary-foreground">
            <span className="text-lg font-bold">E</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">Examprep</h1>
            <p className="text-xs text-muted-foreground">Study Smart</p>
          </div>
          <ThemeToggle className="ml-auto h-9 w-9" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {user?.role === 'admin' && renderNavItem({ icon: LayoutDashboard, label: 'Admin Panel', path: '/admin' })}
        {user?.role === 'admin' && <div className="my-2 h-px bg-border/50" />}
        
        {navItems.map(renderNavItem)}
      </nav>

      {/* Footer / Profile Actions */}
      <div className="p-4 border-t bg-muted/10 relative z-10">
        {/* User Profile Card */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50 mb-3">
          <SmartAvatar
            src={user?.profilePicture}
            email={user?.email}
            name={user?.name}
            size="sm"
            className="border shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {user?.role?.replace('_', ' ') || 'Student'}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          {/* Profile Button */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={() => handleNavigation('/profile')}
          >
            <User className="h-4 w-4" />
            Profile
          </Button>

          {/* Theme Button */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowThemeSelector(true)}
          >
            <Palette className="h-4 w-4" />
            Themes
          </Button>

          {/* Logout Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to logout? You will need to sign in again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Yes, Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Theme Selector Dialog */}
      <DashboardThemeSelector
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </aside>
  );
};

export default Sidebar;