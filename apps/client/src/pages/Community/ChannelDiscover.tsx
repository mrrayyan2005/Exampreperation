import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChannels, joinChannel, leaveChannel, fetchJoinedChannels, fetchTrendingChannels } from '@/api/community';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addJoinedChannel, removeJoinedChannel } from '@/redux/slices/communitySlice';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Compass,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateChannelModal } from '@/components/Community/CreateChannelModal';

const ChannelCard: React.FC<{ 
  channel: any; 
  isJoined: boolean; 
  onJoinToggle: () => void;
}> = ({ channel, isJoined, onJoinToggle }) => {
  return (
    <div className="p-5 flex flex-col h-full rounded-2xl border border-border/60 bg-card hover:shadow-sm hover:border-border transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
          {channel.icon ? (
            <img src={channel.icon} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            channel.name.charAt(0).toUpperCase()
          )}
        </div>
        <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted hover:bg-muted/80 px-2 py-0.5 rounded-md transition-colors">
          {channel.type || 'community'}
        </span>
      </div>
      
      <div className="flex-1">
        <Link to={`/community/channel/${channel.slug}`} className="group">
          <h3 className="font-semibold text-base mb-1.5 text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {channel.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed mb-4">
          {channel.description || 'Welcome to this community channel. Join to see updates and discussions.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-medium">{channel.memberCount?.toLocaleString() || 0} members</span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onJoinToggle();
          }}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95',
            isJoined
              ? 'bg-muted/50 text-muted-foreground border border-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
          )}
        >
          {isJoined ? 'Joined' : 'Join'}
        </button>
      </div>
    </div>
  );
};

const SectionHeading: React.FC<{ title: string; subtitle?: string; icon?: React.ElementType }> = ({ title, subtitle, icon: Icon }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon className="h-5 w-5 text-primary" />}
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
  </div>
);

const ChannelSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card/50 flex flex-col h-[200px] animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="h-5 w-16 rounded-md bg-muted" />
        </div>
        <div className="h-5 w-3/4 bg-muted rounded mb-2" />
        <div className="h-4 w-full bg-muted rounded mb-1" />
        <div className="h-4 w-2/3 bg-muted rounded mb-4" />
        <div className="mt-auto pt-4 border-t border-border/40 flex justify-between">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded-xl" />
        </div>
      </div>
    ))}
  </>
);

const ChannelDiscover: React.FC = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Queries
  const { data: channelsData, isLoading } = useQuery({
    queryKey: ['channels', search],
    queryFn: () => fetchChannels({ search: search || undefined, page: 1 }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-channels-minimal'],
    queryFn: () => fetchTrendingChannels(8).then((r) => r.data.data || []),
    staleTime: 10 * 60 * 1000,
  });

  const { data: joinedData } = useQuery({
    queryKey: ['joined-channels'],
    queryFn: () => fetchJoinedChannels().then((r) => r.data.data || []),
  });

  const joinedIds = new Set((joinedData || []).map((c: any) => c._id));
  const allChannels = channelsData?.data || [];
  const trendingChannels = trendingData || [];

  const joinMutation = useMutation({
    mutationFn: (slug: string) => joinChannel(slug),
    onSuccess: (_, slug) => {
      const ch = allChannels.find((c: any) => c.slug === slug) || trendingChannels.find((c: any) => c.slug === slug);
      if (ch) dispatch(addJoinedChannel(ch));
      queryClient.invalidateQueries({ queryKey: ['joined-channels'] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (slug: string) => leaveChannel(slug),
    onSuccess: (_, slug) => {
      const ch = allChannels.find((c: any) => c.slug === slug) || trendingChannels.find((c: any) => c.slug === slug);
      if (ch) dispatch(removeJoinedChannel(ch._id));
      queryClient.invalidateQueries({ queryKey: ['joined-channels'] });
    },
  });

  const categorizedChannels = useMemo(() => {
    if (!allChannels.length) return [];
    if (activeTab === 'all') return allChannels;
    return allChannels.filter((ch: any) => ch.type === activeTab);
  }, [allChannels, activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10 pb-20">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Compass className="h-7 w-7 text-primary" />
            Discover Communities
          </h1>
          <p className="text-base text-muted-foreground mt-2 max-w-lg leading-relaxed">
            Find the right spaces to collaborate, get resources, and connect with peers targeting the same goals.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, exam, or type..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/80 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-muted-foreground/60"
            />
          </div>
          <button 
            onClick={() => setShowCreate(true)} 
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-secondary/50 text-secondary-foreground hover:bg-secondary border border-border/40 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </div>

      {/* Trending / Recommended Channels (Hidden when searching) */}
      {!search && trendingChannels.length > 0 && (
        <section>
          <SectionHeading 
            title="Trending Now" 
            subtitle="Most active communities this week"
            icon={TrendingUp}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trendingLoading ? (
              <ChannelSkeleton count={4} />
            ) : (
              trendingChannels.slice(0, 4).map((ch: any) => (
                <ChannelCard 
                  key={ch._id}
                  channel={ch}
                  isJoined={joinedIds.has(ch._id)}
                  onJoinToggle={() => joinedIds.has(ch._id) ? leaveMutation.mutate(ch.slug) : joinMutation.mutate(ch.slug)}
                />
              ))
            )}
          </div>
        </section>
      )}

      {/* All Browse Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {search ? 'Search Results' : 'Browse All Space'}
          </h2>
          
          {/* Quick Filters */}
          {!search && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              {['all', 'exam', 'subject', 'college', 'language'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                    activeTab === tab 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 min-h-[300px]">
          {isLoading ? (
            <ChannelSkeleton count={8} />
          ) : categorizedChannels.length === 0 ? (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border/80 bg-card/30">
              <Compass className="h-10 w-10 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold">No communities found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-6">
                We couldn't find any communities matching your criteria. Try adjusting your search or start a new community.
              </p>
              <button 
                onClick={() => setShowCreate(true)}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
              >
                Create Community
              </button>
            </div>
          ) : (
            categorizedChannels.map((ch: any) => (
              <ChannelCard 
                key={ch._id}
                channel={ch}
                isJoined={joinedIds.has(ch._id)}
                onJoinToggle={() => joinedIds.has(ch._id) ? leaveMutation.mutate(ch.slug) : joinMutation.mutate(ch.slug)}
              />
            ))
          )}
        </div>
      </section>

      <CreateChannelModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
};

export default ChannelDiscover;

