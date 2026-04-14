import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPost, fetchComments, fetchChannel } from '@/api/community';
import { CommentThread } from '@/components/Community/CommentThread';
import { VoteButton } from '@/components/Community/VoteButton';
import { PostTagBadge } from '@/components/Community/PostTagBadge';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { ArrowLeft, Eye, MessageCircle, Lock, CheckCircle2, Pin, Sparkles, BookOpen, GraduationCap, Microscope, Flame, Clock, Calendar, AlertOctagon, Layers, Share2 } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useAppSelector } from '@/redux/hooks';
import { AISummaryCard } from '@/components/Community/AISummaryCard';
import { PollCard } from '@/components/Community/PollCard';
import { ReputationBadge } from '@/components/Community/ReputationBadge';
import { cn } from '@/lib/utils';

const POST_TYPE_ICONS: Record<string, string> = {
  question: '❓',
  discussion: '💬',
  resource: '📁',
  strategy: '🎯',
  milestone: '🏆',
};

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId!).then((r) => r.data.data),
    enabled: !!postId,
    staleTime: 60 * 1000,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId!, { sort: 'top' }).then((r) => r.data.data),
    enabled: !!postId,
    staleTime: 30 * 1000,
  });

  const { data: channelData } = useQuery({
    queryKey: ['channel', post?.channelId?.slug],
    queryFn: () => fetchChannel(post!.channelId.slug!).then((r) => r.data.data),
    enabled: !!post?.channelId?.slug,
    staleTime: 5 * 60 * 1000,
  });

  const { user, isLoading: userLoading } = useAppSelector((s) => s.auth);
  const socketRef = React.useRef<any>(null);

  const [viewerCount, setViewerCount] = React.useState(1);
  const [typingUsers, setTypingUsers] = React.useState<Record<string, number>>({}); // username -> timestamp

  // Real-time: join post room on mount, leave on unmount
  useEffect(() => {
    if (!postId) return;

    const socket = io({ path: '/socket.io' });
    socketRef.current = socket;
    socket.emit('community:joinPost', { postId });

    socket.on('community:newComment', ({ postId: pid }: any) => {
      if (pid === postId) {
        queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
      }
    });

    socket.on('community:voteUpdate', ({ targetId, targetType, postId: pid }: any) => {
      if (targetId === postId || pid === postId) {
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
        if (targetType === 'comment') {
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        }
      }
    });

    socket.on('community:pollUpdate', ({ postId: pid }: any) => {
      if (pid === postId) {
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
      }
    });

    socket.on('community:viewerCount', ({ count }: { count: number }) => {
      setViewerCount(count);
    });

    socket.on('community:typing', ({ username }: { username: string }) => {
      setTypingUsers((prev) => ({ ...prev, [username]: Date.now() }));
    });

    // Cleanup stale typing indicators every 3 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((username) => {
          if (now - (next[username] || 0) > 5000) {
            delete next[username];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 3000);

    return () => {
      socket.emit('community:leavePost', { postId });
      socket.disconnect();
      clearInterval(interval);
      socketRef.current = null;
    };
  }, [postId, queryClient]);

  const handleTyping = () => {
    if (!postId || !user?.name || !socketRef.current) return;
    socketRef.current.emit('community:typing', { postId, username: user?.name });
  };

  if (postLoading || userLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="rounded-2xl border border-border p-6 space-y-4 animate-pulse">
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-4 w-full rounded bg-muted" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center py-20">
        <p className="text-xl font-semibold">Post not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Post card */}
      <article className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex gap-4 p-5">
          {/* Vote column */}
          <VoteButton
            targetId={post._id}
            targetType="post"
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            userVote={post.userVote}
            queryKey={['post', postId!]}
            className="flex-shrink-0 mt-1"
          />

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* AI Summary Card — shown for posts with body content */}
            {(post.bodyText?.length > 100 || post.type === 'question') && (
              <AISummaryCard
                postId={post._id}
                postType={post.type}
                existingSummary={post.aiSummary}
              />
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {post.isPinned && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary">
                  <Pin className="h-3 w-3" /> PINNED
                </span>
              )}
              {post.isLocked && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground">
                  <Lock className="h-3 w-3" /> LOCKED
                </span>
              )}
              {post.bounty > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                  💰 {post.bounty} KARMA BOUNTY
                </span>
              )}
              {post.isVerified && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3" /> VERIFIED SOLUTION
                </span>
              )}
              {post.type === 'question' && !post.isSolved && post.examDate && (() => {
                const daysLeft = differenceInDays(new Date(post.examDate), new Date());
                if (daysLeft >= 0 && daysLeft <= 7) {
                  return (
                    <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                      <Flame className="h-3 w-3 fill-rose-600" /> HIGH PRIORITY (Exam in {daysLeft}d)
                    </span>
                  );
                } else if (daysLeft > 7 && daysLeft <= 14) {
                  return (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock className="h-3 w-3" /> PRIORITY (Exam in {daysLeft}d)
                    </span>
                  );
                }
                return null;
              })()}
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {POST_TYPE_ICONS[post.type]} {post.type}
              </span>
              {post.tags?.map((tag: string) => <PostTagBadge key={tag} tag={tag} />)}
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold leading-snug">
              {post.isSolved && (
                <CheckCircle2 className="inline h-5 w-5 text-green-500 mr-1.5 mb-0.5" />
              )}
              {post.title}
            </h1>

            {/* Author + channel */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SmartAvatar
                src={post.isAnonymous ? undefined : post.authorId?.profilePicture}
                email={post.isAnonymous ? undefined : post.authorId?.email}
                name={post.isAnonymous ? 'Anonymous' : post.authorId?.name}
                size="sm"
                className="h-5 w-5"
              />
              <span className="font-medium text-foreground/70">{post.isAnonymous ? 'Anonymous Student' : post.authorId?.name}</span>
              {post.authorId?.progressStats && !post.isAnonymous && (
                <ReputationBadge karma={post.authorId.progressStats.karma} />
              )}
              <span className="opacity-40">·</span>
              {post.channelId && (
                <>
                  <Link
                    to={`/community/channel/${post.channelId.slug}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {post.channelId.name}
                  </Link>
                  <span className="opacity-40">·</span>
                </>
              )}
              <span>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              {/* Viewer count display */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/40">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {viewerCount} {viewerCount === 1 ? 'student' : 'students'} viewing
                </span>
              </div>
            </div>

            {/* Structured Metadata (Question/Resource) */}
            {(post.chapter || post.difficulty || post.questionSource || post.resourceType) && (
              <div className="flex flex-wrap gap-4 py-3 border-y border-border/40 my-6 bg-muted/20 px-4 rounded-xl">
                {post.chapter && (
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Chapter</span>
                      <span className="text-sm font-semibold">{post.chapter}</span>
                    </div>
                  </div>
                )}
                {post.difficulty && (
                  <div className="flex items-start gap-2 ml-2">
                    <Microscope className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-col gap-0.5 min-w-[60px]">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Difficulty</span>
                      <span className={cn(
                        "text-sm font-black uppercase tracking-tight",
                        post.difficulty === 'easy' && "text-emerald-600",
                        post.difficulty === 'medium' && "text-amber-600",
                        post.difficulty === 'hard' && "text-rose-600"
                      )}>{post.difficulty}</span>
                    </div>
                  </div>
                )}
                {post.questionSource && (
                  <div className="flex items-start gap-2 ml-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Source</span>
                      <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{post.questionSource}</span>
                    </div>
                  </div>
                )}
                {post.resourceType && (
                  <div className="flex items-start gap-2 ml-2">
                    <GraduationCap className="h-4 w-4 text-indigo-500 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Type</span>
                      <span className="text-sm font-bold text-indigo-700 uppercase">{post.resourceType}</span>
                    </div>
                  </div>
                )}
                {post.level && (
                  <div className="flex items-start gap-2 ml-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Level</span>
                      <span className="text-sm font-semibold capitalize bg-primary/10 text-primary px-1.5 py-0.5 rounded">{post.level}</span>
                    </div>
                  </div>
                )}
                {post.examDate && (
                  <div className="flex items-start gap-2 ml-2">
                    <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Exam Date</span>
                      <span className="text-sm font-bold text-slate-700">{new Date(post.examDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Body */}
            {post.body && (
              <div className="text-sm leading-relaxed whitespace-pre-wrap border-t border-border/40 pt-3">
                {post.body}
              </div>
            )}

            {/* Structured Doubt Details */}
            {post.type === 'question' && (post.whatITried || post.whereImStuck) && (
              <div className="space-y-4 mt-6">
                {post.whatITried && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 p-4">
                    <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">What I tried</h3>
                    <p className="text-sm leading-relaxed text-blue-900/80">{post.whatITried}</p>
                  </div>
                )}
                {post.whereImStuck && (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-50/50 p-4">
                    <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Where I'm stuck</h3>
                    <p className="text-sm leading-relaxed text-orange-900/80">{post.whereImStuck}</p>
                  </div>
                )}
              </div>
            )}

            {/* Poll */}
            {post.poll && (
              <PollCard
                postId={post._id}
                poll={post.poll}
                isLocked={post.isLocked}
              />
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {post.commentCount} comments
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.viewCount} views
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/community/post/${post._id}`);
                  toast.success('Link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>

              {post.type === 'question' && (
                <>
                  <button
                    onClick={() => {
                      navigate('/mistakes', { state: { fromPostId: post._id } });
                      toast.success('Opening Mistake Notebook...');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-500/20 bg-red-50/50 hover:bg-red-100 text-red-700 transition-colors"
                  >
                    <AlertOctagon className="h-4 w-4" /> Add to mistakes
                  </button>
                  <button
                    onClick={() => {
                      navigate('/flashcards', { state: { fromPostId: post._id } });
                      toast.success('Opening Flashcards...');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-500/20 bg-blue-50/50 hover:bg-blue-100 text-blue-700 transition-colors"
                  >
                    <Layers className="h-4 w-4" /> Save as flashcard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Comments */}
      <section>
        <h2 className="text-base font-semibold mb-4">
          {post.commentCount > 0 ? `${post.commentCount} Comments` : 'Discussion'}
        </h2>
        <CommentThread
          comments={comments || []}
          postId={post._id}
          postAuthorId={post.authorId?._id}
          isModerator={['owner', 'moderator'].includes(channelData?.membership?.role || '')}
          isLoading={commentsLoading}
          typingUsers={typingUsers}
          onTyping={handleTyping}
        />
      </section>
    </div>
  );
};

export default PostDetail;
