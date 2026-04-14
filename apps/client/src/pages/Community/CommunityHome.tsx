import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchJoinedChannels, fetchChannelFeed, UnifiedFeedPost } from '@/api/community';
import { PostCard } from '@/components/Community/PostCard';
import { ChannelSidebar } from '@/components/Community/ChannelSidebar';
import { CreatePostModal } from '@/components/Community/CreatePostModal';
import { CreateChannelModal } from '@/components/Community/CreateChannelModal';
import { useAppSelector } from '@/redux/hooks';
import { Compass, Flame, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { FeedSkeleton } from '@/components/Community/FeedSkeleton';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface ChannelSummary {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

const CommunityHome: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const feedSort = useAppSelector((s) => s.community.feedSort);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [activeChannelSlug, setActiveChannelSlug] = useState<string | null>(null);

  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px',
  });

  // Fetch joined channels
  const { data: joinedData, isLoading: channelsLoading, isError: channelsError } = useQuery({
    queryKey: ['joined-channels'],
    queryFn: async () => {
      const response = await fetchJoinedChannels();
      return response.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const joinedChannels: ChannelSummary[] = joinedData || [];
  const targetSlug = activeChannelSlug || joinedChannels[0]?.slug;

  // Fetch feed for first/active joined channel
  const { 
    data: feedData, 
    isLoading: feedLoading,
    isError: feedError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['channel-feed', targetSlug, feedSort],
    queryFn: ({ pageParam }) => fetchChannelFeed(targetSlug!, { sort: feedSort, page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!targetSlug,
    staleTime: 30 * 1000,
  });

  React.useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts: UnifiedFeedPost[] = feedData?.pages.flatMap((page) => page.data) || [];

  if (channelsError) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="text-center py-20 rounded-2xl border border-destructive/20 bg-destructive/10">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load community</h2>
          <p className="text-muted-foreground mb-4">Please try refreshing the page or check your connection.</p>
          <button onClick={() => window.location.reload()} className="text-sm font-semibold text-destructive underline">Try again</button>
        </div>
      </div>
    );
  }

  // Empty state — no joined channels
  if (!channelsLoading && joinedChannels.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="text-center py-20 rounded-2xl border border-dashed border-border/60 bg-card">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-xl font-bold mb-2">Welcome to the Community!</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Join channels for your exam or subject to see discussions, resources, and connect with other aspirants.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/community/discover"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              <Compass className="h-4 w-4" />
              Discover Channels
            </Link>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="inline-flex items-center gap-2 border border-border px-6 py-2.5 rounded-xl font-semibold hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Channel
            </button>
          </div>
        </div>
        <CreateChannelModal isOpen={showCreateChannel} onClose={() => setShowCreateChannel(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Feed</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Latest from your joined channels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/community/discover"
            className="flex items-center gap-1.5 border border-border px-3 py-2 rounded-xl text-sm hover:bg-muted transition-colors"
          >
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">Discover</span>
          </Link>
          <button
            onClick={() => setShowCreateChannel(true)}
            className="hidden sm:flex items-center gap-1.5 border border-border px-3 py-2 rounded-xl text-sm hover:bg-muted transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Channel
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Post</span>
          </button>
        </div>
      </div>

      {/* Channel quick-switch tabs */}
      {joinedChannels.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveChannelSlug(null)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !activeChannelSlug
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            All
          </button>
          {joinedChannels.slice(0, 8).map((ch: any) => (
            <button
              key={ch._id}
              onClick={() => setActiveChannelSlug(ch.slug)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeChannelSlug === ch.slug
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {ch.icon ? (
                <img src={ch.icon} alt="" className="h-4 w-4 rounded-full" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                  {ch.name[0]}
                </div>
              )}
              {ch.name}
            </button>
          ))}
        </div>
      )}

      {/* Layout */}
      <div className="flex gap-6">
        {/* Feed */}
        <div className="flex-1 min-w-0 space-y-4 pb-12">
          {feedError ? (
             <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-16 text-center">
               <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
               <h3 className="text-lg font-bold text-foreground mb-2">Failed to load feed</h3>
               <p className="text-sm text-muted-foreground mb-4">We couldn't load the latest posts for this channel.</p>
               <button onClick={() => window.location.reload()} className="text-sm rounded-lg border border-border px-4 py-2 hover:bg-muted transition font-medium">Retry</button>
             </div>
          ) : feedLoading ? (
            <FeedSkeleton count={4} />
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card p-16 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Your feed is quiet</h3>
              <p className="text-sm text-muted-foreground mb-6">Start a new discussion or join more channels to see updates here.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
              >
                Create a Post
              </button>
            </div>
          ) : (
            <>
              {posts.map((post: any) => (
                <PostCard
                  key={post._id}
                  post={post}
                  channelSlug={targetSlug}
                  showChannel={!activeChannelSlug}
                />
              ))}
              
              <div ref={targetRef} className="py-6 flex justify-center w-full">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading more...
                  </div>
                ) : hasNextPage ? (
                  <span className="text-sm text-muted-foreground">Scroll for more</span>
                ) : (
                  <span className="text-sm text-muted-foreground/60 flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> You're caught up</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        defaultChannelSlug={targetSlug}
      />

      {/* Create Channel Modal */}
      <CreateChannelModal isOpen={showCreateChannel} onClose={() => setShowCreateChannel(false)} />
    </div>
  );
};

export default CommunityHome;
