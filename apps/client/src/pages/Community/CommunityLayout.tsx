import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setFeedSort } from '@/redux/slices/communitySlice';
import { fetchJoinedChannels, fetchChannels, fetchUnifiedFeed, fetchTrendingChannels } from '@/api/community';
import { CreatePostModal } from '@/components/Community/CreatePostModal';
import { CreateChannelModal } from '@/components/Community/CreateChannelModal';
import { cn } from '@/lib/utils';
import {
  Compass,
  Plus,
  Hash,
  Flame,
  Sparkles,
  TrendingUp,
  BarChart3,
  Search,
  Bell,
  MessageSquare,
  Users,
  ChevronRight,
  Home,
  Award,
  Globe,
} from 'lucide-react';
import { UserReputationCard } from '@/components/Community/UserReputationCard';

// 1. Types & Constants
interface CommunityLayoutProps {
  children?: React.ReactNode;
}

const SORT_OPTIONS = [
  { key: 'hot', label: 'Hot', icon: Flame, desc: 'Most popular right now' },
  { key: 'new', label: 'New', icon: Sparkles, desc: 'Fresh posts first' },
  { key: 'top', label: 'Top', icon: BarChart3, desc: 'Highest rated' },
  { key: 'rising', label: 'Rising', icon: TrendingUp, desc: 'Gaining traction' },
] as const;

// 2. Helper Components
const NavLink: React.FC<{
  to: string;
  active: boolean;
  exact?: boolean;
  children: React.ReactNode;
}> = ({ to, active, children }) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
      active
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    )}
  >
    {children}
  </Link>
);

// 3. Main Component
export const CommunityLayout: React.FC<CommunityLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const feedSort = useAppSelector((s) => s.community?.feedSort || 'hot');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Fetch joined channels
  const { data: joinedData, isLoading: joinedLoading } = useQuery({
    queryKey: ['joined-channels'],
    queryFn: async () => {
      const response = await fetchJoinedChannels();
      return response.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch trending channels for suggestions
  const { data: trendingData } = useQuery({
    queryKey: ['trending-channels'],
    queryFn: async () => {
      const response = await fetchTrendingChannels(5);
      return response.data?.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const joinedChannels = joinedData || [];
  const trendingChannels = trendingData || [];

  const isActivePath = (path: string) => {
    if (path === '/community') {
      return location.pathname === '/community';
    }
    return location.pathname.startsWith(path);
  };

  const isDiscoverPage = location.pathname.startsWith('/community/discover');

  // Handle sort change with prefetch
  const handleSortChange = (sortKey: typeof feedSort) => {
    dispatch(setFeedSort(sortKey));
    // Prefetch next page
    queryClient.prefetchQuery({
      queryKey: ['unified-feed', sortKey],
      queryFn: () =>
        fetchUnifiedFeed({ page: 1, limit: 10, sort: sortKey }).then((r) => r.data.data),
      staleTime: 30 * 1000,
    });
  };

  // Keyboard shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('community-search')?.focus();
      }
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.target) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          setShowCreatePost(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Left: Logo & Nav */}
            <div className="flex items-center gap-6">
              <Link to="/community" className="flex items-center gap-2 font-bold text-lg">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className="hidden sm:block">Community</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <NavLink to="/community" active={location.pathname === '/community'} exact>
                  <Home className="h-4 w-4" />
                  Feed
                </NavLink>
                <NavLink to="/community/popular" active={location.pathname === '/community/popular'}>
                  <Flame className="h-4 w-4" />
                  Popular
                </NavLink>
                <NavLink to="/community/discover" active={location.pathname === '/community/discover'}>
                  <Compass className="h-4 w-4" />
                  Explore
                </NavLink>
                <NavLink to="/r" active={location.pathname === '/r'}>
                  <Globe className="h-4 w-4" />
                  Global
                </NavLink>
              </nav>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-md">
              <div className={cn(
                'relative group transition-all duration-200',
                isSearchFocused && 'scale-105'
              )}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="community-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/community/discover?search=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                  placeholder="Search channels, posts, topics..."
                  className="w-full rounded-full border border-border bg-muted/50 pl-10 pr-20 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreatePost(true)}
                className="hidden sm:flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </button>
              <button
                onClick={() => setShowCreatePost(true)}
                className="sm:hidden flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Nav: Sort Options (only on feed pages) */}
        {(location.pathname === '/community' || location.pathname === '/community/popular' || location.pathname.startsWith('/community/channel')) && (
          <div className="border-t border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-1 py-2 overflow-x-auto">
                <span className="text-xs font-medium text-muted-foreground mr-2 whitespace-nowrap">Sort by:</span>
                {SORT_OPTIONS.map((sort) => (
                  <button
                    key={sort.key}
                    onClick={() => handleSortChange(sort.key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                      feedSort === sort.key
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    title={sort.desc}
                  >
                    <sort.icon className="h-3.5 w-3.5" />
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isDiscoverPage ? (
          // Discover: unique full-width layout, no community sidebars/widgets
          <main className="max-w-5xl mx-auto">
            {children || <Outlet />}
          </main>
        ) : (
        <div className="flex gap-6">
          {/* Left Sidebar - Navigation */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
            {/* Quick Actions */}
            <div className="rounded-xl border border-border/60 bg-card p-3">
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </button>
              <button
                onClick={() => setShowCreateChannel(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mt-2 text-muted-foreground hover:bg-muted transition-colors"
              >
                <Hash className="h-4 w-4" />
                Create Channel
              </button>
            </div>

            {/* Feed shortcuts */}
            <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 px-1">
                Feeds
              </p>
              <Link
                to="/community"
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                  location.pathname === '/community'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Home className="h-4 w-4" />
                My feed
              </Link>
              <Link
                to="/community/popular"
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                  location.pathname === '/community/popular'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Flame className="h-4 w-4" />
                Popular
              </Link>
              <Link
                to="/community/discover"
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                  location.pathname === '/community/discover'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Compass className="h-4 w-4" />
                All channels
              </Link>
              <Link
                to="/r"
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                  location.pathname === '/r'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Globe className="h-4 w-4" />
                Global forum
              </Link>
              <Link
                to="/mistakes"
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <BarChart3 className="h-4 w-4" />
                Mistake notebook
              </Link>
            </div>

            {/* My Channels */}
            <div className="rounded-xl border border-border/60 bg-card p-3">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Joined
                </h3>
              </div>
              {joinedLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : joinedChannels.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground mb-2">No channels yet</p>
                  <Link
                    to="/community/discover"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Discover →
                  </Link>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {joinedChannels.slice(0, 10).map((ch: any) => (
                    <Link
                      key={ch._id}
                      to={`/community/channel/${ch.slug}`}
                      className={cn(
                        'flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors',
                        location.pathname === `/community/channel/${ch.slug}`
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      {ch.icon ? (
                        <img src={ch.icon} alt="" className="h-5 w-5 rounded object-cover" />
                      ) : (
                        <div className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {ch.name[0]}
                        </div>
                      )}
                      <span className="flex-1 truncate">{ch.name}</span>
                    </Link>
                  ))}
                  {joinedChannels.length > 10 && (
                    <Link to="/community/discover" className="block text-center text-[10px] py-1 text-primary hover:underline">
                      View all {joinedChannels.length}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats Summary */}
            <div className="rounded-xl border border-border/60 bg-card p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Community Hub</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Members Joined</span>
                        <span className="font-bold">{joinedChannels.reduce((acc: number, ch: any) => acc + (ch.memberCount || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Total Discussions</span>
                        <span className="font-bold">{joinedChannels.reduce((acc: number, ch: any) => acc + (ch.postCount || 0), 0).toLocaleString()}</span>
                    </div>
                </div>
                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="w-full mt-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold rounded-lg transition-colors border border-primary/20"
                >
                  Start a Discussion
                </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {children || <Outlet />}
          </main>

          {/* Right Sidebar - Additional Info */}
          <aside className="hidden xl:block w-72 flex-shrink-0 space-y-4">
            {/* Reputation Card */}
            {user && (
              <UserReputationCard user={user as any} />
            )}

            {/* Popular Channels */}
            {trendingChannels.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Trending Channels</h3>
                </div>
                <div className="space-y-3">
                  {trendingChannels.slice(0, 5).map((ch: any) => (
                    <Link
                      key={ch._id}
                      to={`/community/channel/${ch.slug}`}
                      className="flex items-center gap-3 rounded-lg group transition-colors"
                    >
                      {ch.icon ? (
                        <img src={ch.icon} alt="" className="h-8 w-8 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shadow-sm group-hover:scale-105 transition-transform">
                          {ch.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{ch.name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Users className="h-2.5 w-2.5" />
                          {ch.memberCount?.toLocaleString() || 0} aspirants
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* About Community */}
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <h3 className="font-semibold mb-2">About Community</h3>
              <p className="text-sm text-muted-foreground">
                Connect with fellow aspirants, share resources, ask questions, and grow together.
              </p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/60">
                <div className="text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-sm font-semibold">
                    {joinedChannels.reduce((acc: number, ch: any) => acc + (ch.memberCount || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Members</div>
                </div>
                <div className="text-center">
                  <MessageSquare className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-sm font-semibold">
                    {joinedChannels.reduce((acc: number, ch: any) => acc + (ch.postCount || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Posts</div>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <h3 className="font-semibold mb-3">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Be respectful and helpful
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Share quality resources
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Use appropriate tags
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  No spam or self-promotion
                </li>
              </ul>
            </div>

            {/* Footer Links */}
            <div className="text-xs text-muted-foreground space-x-2">
              <Link to="/about" className="hover:underline">About</Link>
              <span>·</span>
              <Link to="/privacy" className="hover:underline">Privacy</Link>
              <span>·</span>
              <Link to="/terms" className="hover:underline">Terms</Link>
            </div>
          </aside>
        </div>
        )}
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
      <CreateChannelModal
        isOpen={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
      />
    </div>
  );
};

export default CommunityLayout;
