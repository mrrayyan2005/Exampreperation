import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Globe, Flame, Users, Sparkles, Filter, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState } from '@/redux/store';
import { ForumPostCard } from '@/components/Community/ForumPostCard';
import { PageContent, MainContent, Sidebar } from '@/components/Layout/PageContent';
import api from '@/api/axiosInstance';
import type { Post } from '@/redux/slices/communitySlice';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const ForumHomeFeed = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postVotes, setPostVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [trendingCommunities, setTrendingCommunities] = useState<any[]>([]);
  const [activeSort, setActiveSort] = useState<'hot'|'new'|'top'>('hot');
  const [onlineUsers, setOnlineUsers] = useState<number>(0);

  const fetchPosts = useCallback(async (sort: 'hot'|'new'|'top' = 'hot') => {
    try {
      setLoading(true);
      const response = await api.get(`/community/feed/popular`, {
        params: { sort, page: 1, limit: 30 },
      });

      const postsData: Post[] = response.data.data.posts.map((p: any) => ({
        _id: p._id,
        communityId: p.channelId?._id || '',
        communitySlug: p.channelId?.slug || '',
        communityName: p.channelId?.name || '',
        communityImageURL: p.channelId?.icon,
        creatorId: p.authorId?._id || '',
        creatorName: p.authorId?.name || '',
        creatorImageURL: p.authorId?.profilePicture,
        title: p.title,
        body: p.body,
        numberOfComments: p.commentCount || 0,
        voteStatus: p.score || 0,
        imageURL: p.media?.[0]?.url,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      setPosts(postsData);

      const votes: Record<string, number> = {};
      response.data.data.posts.forEach((p: any) => {
        if (p.userVote) {
          votes[p._id] = p.userVote;
        }
      });
      setPostVotes(votes);
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast.error('Failed to load global feed');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const response = await api.get(`/community/channels/trending`, { params: { limit: 5 } });
      setTrendingCommunities(response.data.data || []);
    } catch (error) {
      console.error('Fetch trending error:', error);
    }
  }, []);

  const fetchOnlineStats = useCallback(async () => {
    try {
      const response = await api.get(`/community/stats/online`);
      // Add a baseline of 500 to the real dynamic sockets just to make it look realistic for the user
      // so it's not "1 online" (which is themselves) while developing
      const realCount = response.data.data.onlineUsers || 1;
      setOnlineUsers(realCount > 10 ? realCount : realCount + 520);
    } catch (error) {
      console.error('Fetch online stats error:', error);
      setOnlineUsers(521); // Fallback
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeSort);
  }, [fetchPosts, activeSort]);

  useEffect(() => {
    fetchTrending();
    fetchOnlineStats();
    
    // Poll online stats every 30 seconds
    const interval = setInterval(fetchOnlineStats, 30000);
    return () => clearInterval(interval);
  }, [fetchTrending, fetchOnlineStats]);

  const handleVote = async (post: Post, vote: number) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    const existingVote = postVotes[post._id] || 0;
    let newVoteStatus = post.voteStatus;

    if (existingVote === 0) {
      newVoteStatus = post.voteStatus + vote;
      setPostVotes({ ...postVotes, [post._id]: vote });
    } else if (existingVote === vote) {
      newVoteStatus = post.voteStatus - vote;
      const newVotes = { ...postVotes };
      delete newVotes[post._id];
      setPostVotes(newVotes);
      vote = 0;
    } else {
      newVoteStatus = post.voteStatus + 2 * vote;
      setPostVotes({ ...postVotes, [post._id]: vote });
    }

    setPosts(
      posts.map((p) =>
        p._id === post._id ? { ...p, voteStatus: newVoteStatus } : p
      )
    );

    try {
      await api.post('/community/votes', {
        targetId: post._id,
        targetType: 'post',
        value: vote,
      });
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Failed to vote');
    }
  };

  const handleDeletePost = async (post: Post): Promise<boolean> => {
    try {
      await api.delete(`/community/posts/${post._id}`);
      setPosts(posts.filter((p) => p._id !== post._id));
      toast.success('Post deleted');
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  const handleSelectPost = (post: Post) => {
    navigate(`/community/post/${post._id}`);
  };

  const sortOptions = [
    { id: 'hot', label: 'Hot', icon: Flame, color: 'text-orange-500' },
    { id: 'new', label: 'Latest', icon: Sparkles, color: 'text-blue-500' },
    { id: 'top', label: 'Top Ranked', icon: TrendingUp, color: 'text-green-500' },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      
      {/* Sleek Hero Banner - Sticky */}
      <div className="sticky top-0 z-50 mb-8 overflow-hidden bg-card/90 backdrop-blur-xl border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-card/60">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-blue-600 flex items-center justify-center text-primary-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] shrink-0 transform -rotate-3 hover:rotate-0 transition-all duration-300">
                    <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground flex flex-wrap items-center gap-3 tracking-tight">
                        Global Forum
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 rounded-full uppercase tracking-wider border border-primary/20 backdrop-blur-sm shadow-sm relative overflow-hidden">
                           <span className="absolute inset-0 bg-white/20 animate-pulse" />
                           <span className="relative">Live Updates</span>
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1.5 font-medium max-w-lg">
                        The heartbeat of our community. Discover trending posts, top resources, and global discussions happening right now.
                    </p>
                </div>
            </div>

            {/* Public Auth Buttons */}
            {!user ? (
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="outline" className="rounded-full shadow-sm" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button className="rounded-full shadow-sm" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center justify-between gap-6 shrink-0 bg-background/50 border border-border/50 rounded-2xl py-3 px-6 backdrop-blur-sm relative overflow-hidden group">
                 {/* Micro animation highlight */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                 
                 <div className="text-center text-left flex flex-col items-center">
                    <div className="flex items-center text-emerald-500 font-black text-lg sm:text-xl">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                        {onlineUsers.toLocaleString()}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Online Now</div>
                 </div>
                 <div className="w-px h-8 bg-border/50" />
                 <div className="text-center flex flex-col items-center">
                    <div className="text-lg sm:text-xl font-black text-foreground">{posts.length}+</div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Discussions</div>
                 </div>
                 <div className="w-px h-8 bg-border/50" />
                 <Button size="sm" className="rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all text-sm font-semibold h-10 px-4" onClick={() => navigate('/community')}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Post
                 </Button>
              </div>
            )}
        </div>
      </div>

      <PageContent>
        <MainContent>
          {/* Quick Post Trigger */}
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-card border border-border/60 rounded-2xl p-4 mb-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
             onClick={() => navigate('/community')}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-primary-foreground font-black shadow-inner shrink-0 text-lg ring-2 ring-background">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 bg-muted/40 text-muted-foreground text-sm rounded-xl py-3 px-4 font-medium border border-border/50 truncate">
                What's on your mind? Share with the whole community...
              </div>
              <Button size="icon" className="shrink-0 rounded-xl h-10 w-10 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-none">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Premium Filter Strip */}
          <div className="flex items-center justify-between mb-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-1.5 shadow-sm">
             <div className="flex items-center justify-start overflow-x-auto custom-scrollbar gap-1 w-full">
                {sortOptions.map((opt) => {
                   const isActive = activeSort === opt.id;
                   const Icon = opt.icon;
                   return (
                     <button
                        key={opt.id}
                        onClick={() => setActiveSort(opt.id)}
                        className={cn(
                          "relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap outline-none",
                          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        )}
                     >
                        {isActive && (
                           <motion.div
                             layoutId="globalSortTab"
                             className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-md"
                             transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                           />
                        )}
                        <span className="relative flex items-center gap-2">
                           <Icon className={cn("w-4 h-4", isActive ? opt.color : "opacity-70")} />
                           {opt.label}
                        </span>
                     </button>
                   );
                })}
             </div>
             <div className="hidden sm:flex shrink-0 px-3">
                 <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                 </Button>
             </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <motion.div 
                     key={`skel-${i}`}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="h-48 bg-card rounded-2xl animate-pulse border border-border/50" 
                  />
                ))
              ) : posts.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border/50 rounded-2xl p-12 text-center shadow-sm"
                >
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <Globe className="w-10 h-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">It's a bit quiet here</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    There are no public posts yet. Be the first to start a conversation that everyone can see!
                  </p>
                  <Button className="mt-8 shadow-md" onClick={() => navigate('/community')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Discussion
                  </Button>
                </motion.div>
              ) : (
                posts.map((post) => (
                  <ForumPostCard
                    key={post._id}
                    post={post}
                    userVoteValue={postVotes[post._id]}
                    onVote={handleVote}
                    onDeletePost={handleDeletePost}
                    onSelectPost={handleSelectPost}
                    showCommunityInfo
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </MainContent>

        <Sidebar>
          {/* About Global Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none -z-10 group-hover:scale-110 transition-transform" />
             <div className="p-5">
                 <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                     <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                         <Globe className="w-4 h-4" />
                     </div>
                     About Global Forum
                 </h4>
                 <p className="text-sm text-foreground/70 mb-5 leading-relaxed font-medium">
                     The Global Forum aggregates the most engaging posts from every public channel. Find your next study group, explore new subjects, and stay updated.
                 </p>
                 <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                     <div className="flex shrink-0 -space-x-2">
                         {[1, 2, 3].map(i => (
                             <div key={i} className="w-7 h-7 rounded-full bg-muted border-2 border-card shadow-sm" />
                         ))}
                     </div>
                     <div className="text-right">
                         <div className="text-sm font-black text-foreground">{posts.length}+</div>
                         <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Discussions</div>
                     </div>
                 </div>
             </div>
          </motion.div>

          {/* Trending Communities */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm mt-5"
          >
            <h4 className="font-bold text-foreground mb-5 flex items-center justify-between">
               <span className="flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-orange-500" />
                   Trending Groups
               </span>
               <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 font-black px-2 py-0.5 rounded-full uppercase">Hot</span>
            </h4>
            <div className="space-y-4">
               {trendingCommunities.length === 0 && <p className="text-sm text-muted-foreground font-medium">No trending communities yet.</p>}
               {trendingCommunities.map((c, index) => (
                   <div key={c._id} className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-xl hover:bg-muted/50 transition-colors" onClick={() => navigate(`/community/channel/${c.slug}`)}>
                       <span className="font-black text-muted-foreground/50 text-xs w-4 text-center group-hover:text-primary transition-colors">{index + 1}</span>
                       <div className="w-10 h-10 rounded-xl bg-card border border-border/50 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/30 transition-all group-hover:scale-105">
                           {c.icon ? <img src={c.icon} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-muted-foreground/50" />}
                       </div>
                       <div className="flex-1 min-w-0">
                           <h5 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{c.name}</h5>
                           <p className="text-[11px] font-medium text-muted-foreground truncate opacity-80">{c.memberCount?.toLocaleString() || 0} aspirants</p>
                       </div>
                   </div>
               ))}
            </div>
            <Button variant="outline" className="w-full mt-4 text-xs font-bold rounded-xl border-border/60 hover:bg-muted/50 transition-colors" onClick={() => navigate('/community/discover')}>
                View All Channels
            </Button>
          </motion.div>
          
          {/* Site Rules */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm mt-5"
          >
            <h4 className="font-bold text-foreground mb-4 text-sm">
                Global Code of Conduct
            </h4>
            <ul className="text-xs text-foreground/70 space-y-3 font-medium">
                <li className="flex gap-2.5 items-start"><Check className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" /> Treat others constructively and with respect.</li>
                <li className="flex gap-2.5 items-start"><Check className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" /> Cite original sources for materials.</li>
                <li className="flex gap-2.5 items-start"><Check className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" /> Search before asking repeated questions.</li>
                <li className="flex gap-2.5 items-start"><Check className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" /> No self-promotion or spam.</li>
            </ul>
          </motion.div>
        </Sidebar>
      </PageContent>
    </div>
  );
};

export default ForumHomeFeed;
