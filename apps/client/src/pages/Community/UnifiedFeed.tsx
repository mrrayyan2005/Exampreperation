import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { PostCard } from '@/components/Community/PostCard';
import { CreatePostModal } from '@/components/Community/CreatePostModal';
import { fetchUnifiedFeed } from '@/api/community';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, WifiOff, PenLine, Flame, CheckCircle2, HelpCircle, BookOpen, Target, MessageCircle, Search, X, Hash } from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  body?: string;
  type: string;
  tags: string[];
  score: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  authorId: { _id: string; name: string; profilePicture?: string; email?: string };
  subchannelId?: { _id: string; name: string; slug: string };
  channelId: { _id: string; name: string; slug: string; icon?: string };
  userVote: number;
  poll?: {
    options: { text: string; votes: number }[];
    totalVotes: number;
    expiresAt?: string;
  };
  createdAt: string;
}

const POSTS_PER_PAGE = 10;

// Custom useInView hook since react-intersection-observer is not installed
const useInView = (options?: IntersectionObserverInit) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
};

interface FilterPillProps {
  icon: React.ReactNode;
  label: string;
  id: string;
  activeId: string;
  onClick: () => void;
}

const FilterPill: React.FC<FilterPillProps> = ({ icon, label, id, activeId, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all z-10',
      id === activeId ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    )}
  >
    {id === activeId && (
      <motion.div
        layoutId="activeFilterTab"
        className="absolute inset-0 bg-primary/10 rounded-full -z-10 border border-primary/20 shadow-sm"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    {icon}
    {label}
  </button>
);

export const UnifiedFeed: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const feedSort = useAppSelector((s) => s.community.feedSort);
  const inViewOptions = useMemo(() => ({ threshold: 0, rootMargin: '100px' }), []);
  const { ref: loadMoreRef, inView } = useInView(inViewOptions);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const scrollPositionRef = useRef(0);
  const [typeFilter, setTypeFilter] = useState<'all' | 'question' | 'discussion' | 'resource' | 'strategy' | 'poll'>('all');
  const [showOnlySolved, setShowOnlySolved] = useState(false);
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const [chapterSearch, setChapterSearch] = useState<string>('');
  const [topicSearch, setTopicSearch] = useState<string>('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['unified-feed', feedSort, typeFilter, showOnlySolved, beginnerFriendlyOnly, difficultyFilter, resourceTypeFilter, chapterSearch, topicSearch],
    queryFn: ({ pageParam = 1 }) =>
      fetchUnifiedFeed({ 
        page: pageParam, 
        limit: POSTS_PER_PAGE, 
        sort: feedSort,
        type: typeFilter,
        isSolved: showOnlySolved || undefined,
        difficulty: difficultyFilter || undefined,
        resourceType: resourceTypeFilter || undefined,
        chapter: chapterSearch || undefined,
        level: beginnerFriendlyOnly ? 'beginner' : undefined,
        topic: topicSearch || undefined
      }).then((r) => r.data.data),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      scrollPositionRef.current = window.scrollY;
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!isFetchingNextPage && scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current);
      scrollPositionRef.current = 0;
    }
  }, [isFetchingNextPage]);

  const posts: Post[] = data?.pages?.flatMap((page) => page.posts) || [];

  if (!isLoading && posts.length === 0 && !isError) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-dashed border-border/60 bg-card/50 backdrop-blur-sm p-12 text-center shadow-sm">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/20">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-black mb-3 text-foreground/90">Your feed is empty</h2>
        <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
          Join channels to see posts from your study communities. Discover channels to find your tribe!
        </p>
        <button
          onClick={() => setShowCreatePost(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-[0_8px_30px_rgba(var(--primary),0.3)] hover:scale-105 active:scale-95"
        >
          Create First Post
        </button>
        <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} />
      </motion.div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[2rem] border border-destructive/20 bg-destructive/5 p-12 text-center backdrop-blur-md">
        <WifiOff className="h-14 w-14 text-destructive mx-auto mb-5 opacity-80" />
        <h2 className="text-xl font-black mb-2 text-destructive">Failed to load feed</h2>
        <p className="text-destructive/80 text-sm mb-6 font-medium">
          {error instanceof Error ? error.message : 'Something went wrong while fetching the community hub.'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 bg-background border border-border text-foreground px-6 py-3 rounded-xl font-bold hover:bg-muted transition-all shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header Profile & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-3 border border-primary/20 shadow-sm">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">
              Your Feed
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Community Hub
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-2 max-w-xl leading-relaxed">
            The best questions, strategies, and resources aggregated from all your active channels. Engage, learn, and grow.
          </p>
        </div>
      </div>

      {/* 2. Quick Create Bar (Premium look) */}
      <div className="rounded-[2rem] border border-white/10 dark:border-white/5 bg-card/80 backdrop-blur-xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center flex-shrink-0 border border-primary/10 shadow-inner">
            <PenLine className="h-6 w-6 text-primary" />
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-6 py-4 rounded-[1.5rem] bg-muted/30 text-muted-foreground hover:bg-background hover:text-foreground transition-all shadow-inner border border-transparent hover:border-border/60 font-semibold text-sm sm:text-base outline-none focus:ring-4 focus:ring-primary/20 group"
          >
            <span className="group-hover:text-primary transition-colors">What do you want to ask or share with the community today?</span>
          </button>
          <button
            onClick={() => setShowCreatePost(true)}
            className="hidden sm:inline-flex bg-primary text-primary-foreground px-8 py-4 rounded-[1.5rem] font-black hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_8px_20px_rgba(var(--primary),0.25)] tracking-wide"
          >
            Post
          </button>
        </div>
      </div>

      {/* 3. Advanced Filtering & Search Dashboard */}
      <div className="rounded-[2rem] border border-white/10 dark:border-white/5 bg-card/60 backdrop-blur-xl overflow-visible shadow-sm relative z-10">
        {/* Top Type Tabs */}
        <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-border/40">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mx-2 flex-shrink-0">
            Show:
          </span>
          <div className="flex bg-muted/30 p-1 rounded-full border border-border/50">
            <FilterPill
              id="all" activeId={typeFilter} onClick={() => { setTypeFilter('all'); setDifficultyFilter(''); setResourceTypeFilter(''); }}
              icon={<Sparkles className="h-4 w-4" />} label="Everything"
            />
            <FilterPill
              id="question" activeId={typeFilter} onClick={() => { setTypeFilter('question'); setResourceTypeFilter(''); }}
              icon={<HelpCircle className="h-4 w-4" />} label="Questions"
            />
            <FilterPill
              id="discussion" activeId={typeFilter} onClick={() => { setTypeFilter('discussion'); setDifficultyFilter(''); setResourceTypeFilter(''); }}
              icon={<MessageCircle className="h-4 w-4" />} label="Discussions"
            />
            <FilterPill
              id="resource" activeId={typeFilter} onClick={() => { setTypeFilter('resource'); setDifficultyFilter(''); }}
              icon={<BookOpen className="h-4 w-4" />} label="Resources"
            />
            <FilterPill
              id="strategy" activeId={typeFilter} onClick={() => { setTypeFilter('strategy'); setDifficultyFilter(''); setResourceTypeFilter(''); }}
              icon={<Target className="h-4 w-4" />} label="Strategies"
            />
          </div>
        </div>

        {/* Bottom Search & Toggles */}
        <div className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          
          <div className="flex flex-wrap items-center gap-4">
            {typeFilter === 'question' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 bg-background/50 p-1.5 rounded-2xl border border-border/50 shadow-sm">
                <span className="text-[10px] font-black text-muted-foreground uppercase px-3 tracking-widest">Difficulty</span>
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(difficultyFilter === d ? '' : d)}
                    className={cn(
                      "text-xs px-4 py-1.5 rounded-xl font-bold uppercase transition-all",
                      difficultyFilter === d 
                        ? (d === 'easy' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : d === 'medium' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-rose-500 text-white shadow-md shadow-rose-500/20')
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </motion.div>
            )}

            {typeFilter === 'resource' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 bg-background/50 p-1.5 rounded-2xl border border-border/50 shadow-sm">
                <span className="text-[10px] font-black text-muted-foreground uppercase px-3 tracking-widest">Format</span>
                {['book', 'notes', 'video'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setResourceTypeFilter(resourceTypeFilter === r ? '' : r)}
                    className={cn(
                      "text-xs px-4 py-1.5 rounded-xl font-bold uppercase transition-all",
                      resourceTypeFilter === r 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </motion.div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOnlySolved((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold border transition-all shadow-sm',
                  showOnlySolved
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 shadow-emerald-500/10'
                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/60'
                )}
              >
                <CheckCircle2 className="h-4 w-4" /> Solved
              </button>
              <button
                onClick={() => setBeginnerFriendlyOnly((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold border transition-all shadow-sm',
                  beginnerFriendlyOnly
                    ? 'border-sky-500/40 bg-sky-500/10 text-sky-600 shadow-sky-500/10'
                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/60'
                )}
              >
                <Sparkles className="h-4 w-4" /> Beginner
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="relative w-full sm:w-56 group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Filter by concept..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="w-full bg-background/50 border border-border/60 rounded-xl py-2.5 pl-10 pr-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-bold placeholder:font-medium shadow-inner"
              />
              {topicSearch && (
                <button onClick={() => setTopicSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-muted rounded-full h-5 w-5 hover:bg-muted-foreground/20 transition-colors">
                  <X className="h-3 w-3 text-foreground" />
                </button>
              )}
            </div>

            {(typeFilter === 'question' || typeFilter === 'resource') && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} className="relative w-full sm:w-56 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Find chapter..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full bg-background/50 border border-border/60 rounded-xl py-2.5 pl-10 pr-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-bold placeholder:font-medium shadow-inner"
                />
                {chapterSearch && (
                  <button onClick={() => setChapterSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-muted rounded-full h-5 w-5 hover:bg-muted-foreground/20 transition-colors">
                    <X className="h-3 w-3 text-foreground" />
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Feed Container */}
      <div className="space-y-4 pt-2">
        {posts.map((post: Post, index: number) => (
          <PostCard
            key={post._id}
            post={post}
            channelSlug={post.channelId.slug}
            showChannel={true}
            className={cn(
              post.isPinned && 'border-primary/30 bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5 relative',
              'transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 z-0'
            )}
          />
        ))}

        {isFetchingNextPage && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-[2rem] border border-border/60 bg-card/40 backdrop-blur-sm animate-pulse shadow-sm">
                <div className="p-5 flex gap-5">
                  <div className="w-10 h-24 bg-muted/50 rounded-xl" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="h-4 bg-muted/60 rounded max-w-[150px]" />
                    <div className="h-7 bg-muted/50 rounded max-w-[400px]" />
                    <div className="h-4 bg-muted/60 rounded max-w-[300px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasNextPage && !isFetchingNextPage && (
          <div ref={loadMoreRef} className="h-10" />
        )}

        {!hasNextPage && posts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center py-10 opacity-70">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-border to-transparent mx-auto mb-4" />
            <p className="text-sm font-bold text-muted-foreground">
              You've reached the end of your feed
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-3 text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
            >
              Back to top ↑
            </button>
          </motion.div>
        )}
      </div>

      <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} />
    </div>
  );
};

export default UnifiedFeed;
