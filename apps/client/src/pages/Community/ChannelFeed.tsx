import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChannel, fetchChannelFeed, joinChannel, leaveChannel } from '@/api/community';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addJoinedChannel, removeJoinedChannel, setCurrentChannelSlug, setFeedSort } from '@/redux/slices/communitySlice';
import { PostCard } from '@/components/Community/PostCard';
import { ChannelSidebar } from '@/components/Community/ChannelSidebar';
import { CreatePostModal } from '@/components/Community/CreatePostModal';
import { Users, MessageSquare, Plus, Settings, Flame, Clock, TrendingUp, Search, X, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { io } from 'socket.io-client';

interface ChannelDetail {
  _id: string;
  name: string;
  slug: string;
  banner?: string;
  icon?: string;
  description?: string;
  type: string;
  isVerified: boolean;
  isJoined: boolean;
  memberCount: number;
  postCount: number;
  subchannels: Array<{ _id: string; name: string; slug: string; postCount: number }>;
  membership: { role: string; karma: number; joinedAt: string } | null;
}

const ChannelFeed: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const feedSort = useAppSelector((s) => s.community?.feedSort || 'hot');
  const { user } = useAppSelector((s) => s.auth);

  const [activeSubchannelId, setActiveSubchannelId] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [page] = useState(1);
  const [typeFilter, setTypeFilter] = useState<'all' | 'question' | 'discussion' | 'resource' | 'strategy' | 'poll'>('all');
  const [showOnlySolved, setShowOnlySolved] = useState(false);
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const [chapterSearch, setChapterSearch] = useState<string>('');
  const [topicSearch, setTopicSearch] = useState<string>('');

  // Fetch channel info
  const { data: channelData } = useQuery<ChannelDetail>({
    queryKey: ['channel', slug],
    queryFn: () => fetchChannel(slug!).then((r) => r.data.data),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  // Real-time: join channel room
  React.useEffect(() => {
    if (!slug) return;

    const socket = io({ path: '/socket.io' });
    socket.emit('community:joinChannel', { channelSlug: slug });

    socket.on('community:newPost', ({ channelSlug: cs }: any) => {
      if (cs === slug) {
        queryClient.invalidateQueries({ queryKey: ['channel-feed', slug] });
        queryClient.invalidateQueries({ queryKey: ['channel', slug] });
      }
    });

    socket.on('community:voteUpdate', ({ targetId, targetType }: any) => {
      // If it's a post in this channel, we might want to refresh. 
      // Simplified: refresh feed on any post vote for ranking updates
      if (targetType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['channel-feed', slug] });
      }
    });

    socket.on('community:pollUpdate', () => {
      queryClient.invalidateQueries({ queryKey: ['channel-feed'] });
    });

    return () => {
      socket.emit('community:leaveChannel', { channelSlug: slug });
      socket.disconnect();
    };
  }, [slug, queryClient]);

  // Side effect: update redux when channel loads
  React.useEffect(() => {
    if (slug && channelData) dispatch(setCurrentChannelSlug(slug));
  }, [channelData, slug, dispatch]);

  // Fetch posts feed
  const { data: feedData, isLoading: feedLoading } = useQuery({
    queryKey: ['channel-feed', slug, feedSort, activeSubchannelId, page],
    queryFn: () =>
      fetchChannelFeed(slug!, {
        sort: feedSort,
        subchannelId: activeSubchannelId || undefined,
        type: typeFilter,
        isSolved: showOnlySolved || undefined,
        difficulty: difficultyFilter || undefined,
        resourceType: resourceTypeFilter || undefined,
        chapter: chapterSearch || undefined,
        level: beginnerFriendlyOnly ? 'beginner' : undefined,
        topic: topicSearch || undefined,
        page,
      }).then((r) => r.data),
    enabled: !!slug,
    staleTime: 30 * 1000,
  });

  const isJoined = !!channelData?.isJoined;

  const joinMutation = useMutation({
    mutationFn: () => joinChannel(slug!),
    onSuccess: () => {
      if (channelData) dispatch(addJoinedChannel(channelData));
      queryClient.invalidateQueries({ queryKey: ['channel', slug] });
      queryClient.invalidateQueries({ queryKey: ['joined-channels'] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveChannel(slug!),
    onSuccess: () => {
      if (channelData) dispatch(removeJoinedChannel(channelData._id));
      queryClient.invalidateQueries({ queryKey: ['channel', slug] });
      queryClient.invalidateQueries({ queryKey: ['joined-channels'] });
    },
  });

  if (!channelData) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="h-40 rounded-2xl bg-muted animate-pulse mb-6" />
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="w-60 h-64 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  const filteredPosts: any[] = feedData?.data || [];

  const pinnedPosts = filteredPosts.filter((p: any) => p.isPinned);
  const normalPosts = filteredPosts.filter((p: any) => !p.isPinned);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Channel Header */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {channelData.banner ? (
          <img src={channelData.banner} alt="" className="w-full h-32 object-cover" />
        ) : (
          <div className="w-full h-24 bg-gradient-to-r from-primary/80 to-primary/40" />
        )}
        <div className="p-5 flex items-start gap-4">
          <div className="-mt-8 h-16 w-16 rounded-xl border-4 border-card bg-primary flex items-center justify-center text-2xl font-black text-primary-foreground shadow-lg flex-shrink-0">
            {channelData.icon ? (
              <img src={channelData.icon} alt="" className="h-full w-full rounded-lg object-cover" />
            ) : (
              channelData.name[0]
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{channelData.name}</h1>
              {channelData.isVerified && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  ✓ Verified
                </span>
              )}
            </div>
            {channelData.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{channelData.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {channelData.memberCount?.toLocaleString()} members
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {channelData.postCount?.toLocaleString()} posts
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isJoined && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Post
              </button>
            )}
            {['owner', 'moderator'].includes(channelData.membership?.role || '') && (
              <button
                onClick={() => navigate(`/community/channel/${slug}/admin`)}
                className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
                title="Manage Channel"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => (isJoined ? leaveMutation.mutate() : joinMutation.mutate())}
              disabled={joinMutation.isPending || leaveMutation.isPending}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                isJoined
                  ? 'border border-border hover:text-destructive hover:border-destructive/50'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {joinMutation.isPending || leaveMutation.isPending
                ? '...'
                : isJoined
                ? 'Joined ✓'
                : 'Join'}
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Feed Column */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Feed Header / Sort + Filters */}
          <div className="flex flex-col gap-2 bg-card border border-border/60 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[
                  { id: 'hot', label: 'Hot', icon: Flame },
                  { id: 'new', label: 'New', icon: Clock },
                  { id: 'top', label: 'Top', icon: TrendingUp },
                ].map((sort) => (
                  <button
                    key={sort.id}
                    onClick={() => dispatch(setFeedSort(sort.id as any))}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      feedSort === sort.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <sort.icon className="h-4 w-4" />
                    {sort.label}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Sort
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'question', label: 'Questions' },
                  { id: 'resource', label: 'Resources' },
                  { id: 'discussion', label: 'Discussions' },
                  { id: 'strategy', label: 'Strategies' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setTypeFilter(f.id as any);
                      setDifficultyFilter('');
                      setResourceTypeFilter('');
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors',
                      typeFilter === f.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:bg-muted/60'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
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
                  ✓ Solved
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
                  ★ Beginner
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 mt-2 w-full">
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
                <div className="relative w-full max-w-[200px]">
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-muted-foreground/20 rounded-full h-3.5 w-3.5 hover:bg-muted-foreground/40"
                    >
                      <X className="h-2 w-2 text-foreground" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Feed Posts */}
          {feedLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-xl border border-border animate-pulse bg-muted/30" />
            ))
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-muted-foreground">No posts yet</p>
              {isJoined && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Create the first post →
                </button>
              )}
            </div>
          ) : (
            <>
              {pinnedPosts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span className="w-1.5 h-6 rounded-full bg-primary/60" />
                    Pinned by moderators
                  </div>
                  {pinnedPosts.map((post: any) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      channelSlug={slug}
                      className="border-primary/40 bg-primary/5"
                    />
                  ))}
                  <div className="border-b border-border/60 my-2" />
                </div>
              )}

              {normalPosts.map((post: any) => (
                <PostCard key={post._id} post={post} channelSlug={slug} />
              ))}
            </>
          )}
        </div>

        {/* Sidebar */}
        <ChannelSidebar
          subchannels={channelData.subchannels}
          activeSubchannelId={activeSubchannelId || undefined}
          onSubchannelSelect={setActiveSubchannelId}
        />
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        defaultChannelSlug={slug}
        onSuccess={(postId) => navigate(`/community/post/${postId}`)}
      />
    </div>
  );
};

export default ChannelFeed;
