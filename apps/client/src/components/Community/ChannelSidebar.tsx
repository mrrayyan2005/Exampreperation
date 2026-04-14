import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCurrentChannelSlug, setFeedSort } from '@/redux/slices/communitySlice';
import { fetchJoinedChannels, fetchStudyRooms, createStudyRoom } from '@/api/community';
import { Compass, Hash, ChevronRight, Flame, Sparkles, TrendingUp, BarChart3, User, Play, Clock, Coffee, Brain, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedSort } from '@/redux/slices/communitySlice';
import { KarmaLeaderboard } from './KarmaLeaderboard';

const SORT_OPTIONS: { key: FeedSort; label: string; icon: React.ReactNode }[] = [
  { key: 'hot', label: 'Hot', icon: <Flame className="h-3.5 w-3.5" /> },
  { key: 'new', label: 'New', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { key: 'top', label: 'Top', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { key: 'rising', label: 'Rising', icon: <TrendingUp className="h-3.5 w-3.5" /> },
];

interface ChannelSidebarProps {
  subchannels?: { _id: string; name: string; slug: string; postCount: number }[];
  activeSubchannelId?: string;
  onSubchannelSelect?: (id: string | null) => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  subchannels,
  activeSubchannelId,
  onSubchannelSelect,
}) => {
  const dispatch = useAppDispatch();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAppSelector((s) => s.auth);
  const feedSort = useAppSelector((s) => s.community.feedSort);
  const mySnippets = useAppSelector((s) => s.community?.mySnippets || []);
  const reduxJoinedChannels = useAppSelector((s: any) => s.community?.joinedChannels);
  
  const joinedChannels = reduxJoinedChannels || mySnippets.map((s: any) => ({
    _id: s.communityId,
    name: s.communityName,
    slug: s.communitySlug,
    icon: s.imageURL
  }));

  // Fetch joined channels from API if not in Redux
  const { data: joinedData } = useQuery({
    queryKey: ['joined-channels'],
    queryFn: async () => {
      const response = await fetchJoinedChannels();
      return response.data?.data ?? [];
    },
    enabled: !joinedChannels || joinedChannels.length === 0,
    staleTime: 5 * 60 * 1000,
  });

  const channels = (joinedChannels && Array.isArray(joinedChannels) && joinedChannels.length > 0) 
    ? joinedChannels 
    : (joinedData || []);

  const { data: studyRoomsData } = useQuery({
    queryKey: ['channel-study-rooms', slug],
    queryFn: async () => {
      if (!slug) return [];
      const res = await fetchStudyRooms(slug);
      return res.data?.data || [];
    },
    enabled: !!slug,
    refetchInterval: 5000, 
  });
  
  const studyRooms = studyRoomsData || [];

  const handleCreateRoom = async () => {
    if (!slug) return;
    try {
      const res = await createStudyRoom(slug, {
         name: `${user?.name || 'My'} Study Room`,
         description: 'Join me for a focused pomodoro session!'
      });
      if (res.data?.data?._id) {
         window.location.href = `/community/channel/${slug}/room/${res.data.data._id}`;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="w-60 flex-shrink-0 space-y-4">
      {/* Active Study Rooms */}
      <div className="rounded-xl border border-border/60 bg-gradient-to-b from-primary/5 to-card p-3 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Live Rooms
          </p>
          <button onClick={handleCreateRoom} className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors">
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-1.5">
          {studyRooms.length === 0 ? (
             <div className="text-center py-4 bg-background/50 rounded-lg border border-border/40">
                <Coffee className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground px-2 pb-2">No active sessions.</p>
                <button 
                  onClick={handleCreateRoom}
                  className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                  Start one now
                </button>
             </div>
          ) : (
             studyRooms.map((room: any) => (
                <Link
                  key={room._id}
                  to={`/community/channel/${slug}/room/${room._id}`}
                  className="group flex flex-col gap-1.5 bg-background border border-border/50 rounded-lg p-2.5 hover:border-primary/40 hover:shadow-sm transition-all relative overflow-hidden"
                >
                  {room.status === 'focus' && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />}
                  {room.status === 'break' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />}
                  {room.status === 'idle' && <div className="absolute top-0 left-0 w-1 h-full bg-muted-foreground" />}
                  
                  <div className="flex items-center justify-between pl-1.5">
                     <span className="text-xs font-bold truncate pr-2 group-hover:text-primary transition-colors">{room.name}</span>
                     <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded pl-1">
                       <User className="h-2.5 w-2.5" />
                       {room.participants?.length || 0}
                     </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pl-1.5 font-medium">
                     {room.status === 'focus' ? (
                       <><Brain className="h-3 w-3 text-rose-500" /> <span className="text-rose-600">Focusing</span></>
                     ) : room.status === 'break' ? (
                       <><Coffee className="h-3 w-3 text-emerald-500" /> <span className="text-emerald-600">On Break</span></>
                     ) : (
                       <><Play className="h-3 w-3" /> Waiting</>
                     )}
                  </div>
                </Link>
             ))
          )}
        </div>
      </div>
      {/* Subchannels / Topics - THE PRIMARY PURPOSE OF THIS SIDEBAR */}
      {subchannels && subchannels.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Browse Topics
          </p>
          <div className="space-y-1">
            <button
                onClick={() => onSubchannelSelect?.(null)}
                className={cn(
                'w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
                !activeSubchannelId
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
            >
                <Hash className="h-4 w-4" />
                All Discussions
            </button>
            {subchannels.map((sub) => (
                <button
                key={sub._id}
                onClick={() => onSubchannelSelect?.(sub._id)}
                className={cn(
                    'w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
                    activeSubchannelId === sub._id
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                >
                <Hash className="h-4 w-4" />
                <span className="flex-1 text-left truncate">{sub.name}</span>
                {sub.postCount > 0 && (
                    <span className="text-[10px] font-bold opacity-40">{sub.postCount}</span>
                )}
                </button>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines or Channel Specific Info could go here */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Participation</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
              Engage with topics to earn karma and level up your reputation in this channel.
          </p>
          <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Channel Posts</span>
              <span className="text-sm font-bold">
                  {subchannels?.reduce((acc, s) => acc + s.postCount, 0) || 0}
              </span>
          </div>
      </div>
    </nav>
  );
};
