import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { PostCard } from '@/components/Community/PostCard';
import { CreatePostModal } from '@/components/Community/CreatePostModal';
import { fetchPopularFeed } from '@/api/community';
import { cn } from '@/lib/utils';
import { Sparkles, Loader2, RefreshCw, WifiOff, PenLine, Flame, CheckCircle2, HelpCircle, BookOpen, Target, MessageCircle, Search, X, Hash } from 'lucide-react';
import { toast } from 'sonner';
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

// Small helper for filter chips
interface FilterPillProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterPill: React.FC<FilterPillProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors',
      active ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted/60'
    )}
  >
    {icon}
    {label}
  </button>
);

export const PopularFeed: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const feedSort = useAppSelector((s) => s.community.feedSort);
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0, rootMargin: '100px' });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const scrollPositionRef = useRef(0);
  const [typeFilter, setTypeFilter] = useState<'all' | 'question' | 'discussion' | 'resource' | 'strategy' | 'poll'>('all');
  const [showOnlySolved, setShowOnlySolved] = useState(false);
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const [chapterSearch, setChapterSearch] = useState<string>('');
  const [topicSearch, setTopicSearch] = useState<string>('');

  // Infinite query for feed
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['unified-feed', feedSort, typeFilter, showOnlySolved, beginnerFriendlyOnly, difficultyFilter, resourceTypeFilter, chapterSearch, topicSearch],
    queryFn: ({ pageParam = 1 }) =>
      fetchPopularFeed({ 
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
      }).then(
        (r) => r.data.data
      ),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      scrollPositionRef.current = window.scrollY;
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Restore scroll position after fetch
  useEffect(() => {
    if (!isFetchingNextPage && scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current);
      scrollPositionRef.current = 0;
    }
  }, [isFetchingNextPage]);

  // Flatten posts from all pages
  const posts: Post[] = data?.pages?.flatMap((page) => page.posts) || [];

  // Empty state
  if (!isLoading && posts.length === 0 && !isError) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card p-12 text-center">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Your feed is empty</h2>
        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
          Join channels to see posts from your study communities. Discover channels to find your tribe!
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setShowCreatePost(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Create First Post
          </button>
        </div>
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
        />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center">
        <WifiOff className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Failed to load feed</h2>
        <p className="text-muted-foreground text-sm mb-4">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Popular style */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-1">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Popular
            </span>
          </div>
          <h1 className="text-xl font-bold leading-tight">Today&apos;s Community Feed</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Best questions, strategies, and resources from all the exam channels you&apos;ve joined.
          </p>
        </div>
        {/* Type filters + solved toggle */}
        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex flex-wrap justify-end gap-1">
            <FilterPill
              icon={<Sparkles className="h-3 w-3" />}
              label="All"
              active={typeFilter === 'all'}
              onClick={() => { setTypeFilter('all'); setDifficultyFilter(''); setResourceTypeFilter(''); }}
            />
            <FilterPill
              icon={<HelpCircle className="h-3 w-3" />}
              label="Questions"
              active={typeFilter === 'question'}
              onClick={() => { setTypeFilter('question'); setResourceTypeFilter(''); }}
            />
            <FilterPill
              icon={<MessageCircle className="h-3 w-3" />}
              label="Discussions"
              active={typeFilter === 'discussion'}
              onClick={() => { setTypeFilter('discussion'); setDifficultyFilter(''); setResourceTypeFilter(''); }}
            />
            <FilterPill
              icon={<BookOpen className="h-3 w-3" />}
              label="Resources"
              active={typeFilter === 'resource'}
              onClick={() => { setTypeFilter('resource'); setDifficultyFilter(''); }}
            />
            <FilterPill
              icon={<Target className="h-3 w-3" />}
              label="Strategies"
              active={typeFilter === 'strategy'}
              onClick={() => { setTypeFilter('strategy'); setDifficultyFilter(''); setResourceTypeFilter(''); }}
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-2 mt-1">
            {typeFilter === 'question' && (
              <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border/40">
                <span className="text-[10px] font-bold text-muted-foreground uppercase px-1">Difficulty:</span>
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(difficultyFilter === d ? '' : d)}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase transition-all",
                      difficultyFilter === d 
                        ? (d === 'easy' ? 'bg-green-500 text-white' : d === 'medium' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white')
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            {typeFilter === 'resource' && (
              <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border/40">
                <span className="text-[10px] font-bold text-muted-foreground uppercase px-1">Type:</span>
                {['book', 'notes', 'video'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setResourceTypeFilter(resourceTypeFilter === r ? '' : r)}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase transition-all",
                      resourceTypeFilter === r 
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowOnlySolved((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors',
                showOnlySolved
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600'
                  : 'border-border text-muted-foreground hover:bg-muted/60'
              )}
            >
              <CheckCircle2 className="h-3 w-3" />
              Only solved
            </button>
            <button
              onClick={() => setBeginnerFriendlyOnly((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors',
                beginnerFriendlyOnly
                  ? 'border-sky-500/60 bg-sky-500/10 text-sky-600'
                  : 'border-border text-muted-foreground hover:bg-muted/60'
              )}
            >
              <Sparkles className="h-3 w-3" />
              Beginner
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 mt-1">
            <div className="relative w-full max-w-[140px]">
              <Hash className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Topic..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="w-full bg-muted/40 border border-border/40 rounded-lg py-1 pl-7 pr-7 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              {topicSearch && (
                <button 
                  onClick={() => setTopicSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-muted-foreground/20 rounded-full h-3.5 w-3.5 hover:bg-muted-foreground/40"
                >
                  <X className="h-2 w-2 text-foreground" />
                </button>
              )}
            </div>

            {(typeFilter === 'question' || typeFilter === 'resource') && (
            <div className="relative w-full max-w-[200px] mt-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by chapter..."
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                className="w-full bg-muted/40 border border-border/40 rounded-lg py-1 pl-7 pr-7 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              {chapterSearch && (
                <button 
                  onClick={() => setChapterSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Quick Create Bar */}
      <div className="rounded-xl border border-border/60 bg-card p-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <PenLine className="h-5 w-5 text-primary" />
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            What's on your mind?
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {posts.map((post: Post, index: number) => (
          <PostCard
            key={post._id}
            post={post}
            channelSlug={post.channelId.slug}
            showChannel={true}
            className={cn(
              post.isPinned && 'border-primary/30 bg-primary/5'
            )}
          />
        ))}

        {/* Loading skeleton */}
        {isFetchingNextPage && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-32 rounded-xl border border-border/60 bg-card animate-pulse"
              >
                <div className="p-4 flex gap-3">
                  <div className="w-8 h-20 bg-muted rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more trigger */}
        {hasNextPage && !isFetchingNextPage && (
          <div ref={loadMoreRef} className="h-4" />
        )}

        {/* End of feed */}
        {!hasNextPage && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              You've reached the end of your feed
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Back to top ↑
            </button>
          </div>
        )}
      </div>

      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
    </div>
  );
};



export default PopularFeed;
