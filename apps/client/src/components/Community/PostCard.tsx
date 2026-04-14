import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Bookmark, Share2, Pin, Lock, CheckCircle2, Flag, MoreHorizontal, ExternalLink, Layers, AlertOctagon, Sparkles, BookOpen, GraduationCap, Flame, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { VoteButton } from '@/components/Community/VoteButton';
import { PostTagBadge } from '@/components/Community/PostTagBadge';
import { cn } from '@/lib/utils';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { castReport } from '@/api/communityPhase2';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PollCard } from '@/components/Community/PollCard';
import { ReputationBadge } from '@/components/Community/ReputationBadge';

const POST_TYPE_ICONS: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  question: { icon: '❓', label: 'Question', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  discussion: { icon: '💬', label: 'Discussion', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  resource: { icon: '📁', label: 'Resource', color: 'text-green-600', bgColor: 'bg-green-50' },
  strategy: { icon: '🎯', label: 'Strategy', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  milestone: { icon: '🏆', label: 'Milestone', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  poll: { icon: '📊', label: 'Poll', color: 'text-pink-600', bgColor: 'bg-pink-50' },
};

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
  authorId: { 
    _id: string; 
    name: string; 
    profilePicture?: string; 
    email?: string;
    progressStats?: {
      karma: number;
    }
  };
  subchannelId?: { _id: string; name: string; slug: string };
  channelId?: { _id: string; name: string; slug: string; icon?: string };
  userVote: number;
  poll?: {
    options: { text: string; votes: number }[];
    totalVotes: number;
    expiresAt?: string;
  };
  // Structured fields
  chapter?: string;
  difficulty?: string;
  questionSource?: string;
  whatITried?: string;
  whereImStuck?: string;
  resourceType?: string;
  level?: string;
  examRelevance?: string[];
  bounty?: number;
  isAnonymous?: boolean;
  isVerified?: boolean;
  examDate?: string;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  channelSlug?: string;
  showChannel?: boolean;
  className?: string;
}

// Helper Component for Action Buttons
interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  as?: React.ElementType;
  to?: string;
  className?: string;
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
  as: Component = 'button',
  to,
  className,
}: ActionButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors',
    active
      ? 'text-primary bg-primary/10'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    className
  );

  if (Component === Link && to) {
    return (
      <Link to={to} className={baseClasses}>
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  channelSlug,
  showChannel = false,
  className,
}) => {
  const typeInfo = POST_TYPE_ICONS[post.type] || { icon: '💬', label: 'Discussion', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [isSaved, setIsSaved] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);

  const hasBody = post.body && post.body.trim().length > 0;
  const bodyPreview = hasBody
    ? post.body!.replace(/<[^>]*>/g, '').slice(0, 150)
    : '';
  const hasMoreContent = hasBody && post.body!.replace(/<[^>]*>/g, '').length > 150;

  const handleReport = useCallback(async () => {
    try {
      await castReport({ targetId: post._id, targetType: 'post', reason: reportReason });
      toast.success('Report submitted. Thank you for helping keep the community safe.');
      setReportOpen(false);
    } catch {
      toast.error('Failed to submit report. Please try again.');
    }
  }, [post._id, reportReason]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/community/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  }, [post._id]);

  const handleSave = useCallback(() => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Post removed from saved' : 'Post saved for later');
  }, [isSaved]);

  return (
    <article
      className={cn(
        'group flex gap-3 sm:gap-4 rounded-[1.5rem] border border-border/40 bg-background overflow-hidden relative',
        'transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]',
        post.isPinned && 'border-primary/40 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
        className
      )}
    >
      {/* Decorative Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {/* Vote Column - Floating style */}
      <div className="flex-shrink-0 w-12 sm:w-14 py-3 sm:py-5 bg-gradient-to-b from-muted/30 to-transparent flex flex-col items-center gap-1 sm:gap-2 border-r border-border/20 z-10">
        <VoteButton
          targetId={post._id}
          targetType="post"
          upvotes={post.upvotes}
          downvotes={post.downvotes}
          userVote={post.userVote}
          queryKey={['unified-feed']}
          className="flex-col"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 py-2 sm:py-3 pr-2 sm:pr-4">
        {/* Header: Type badge + meta - More compact on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
          {/* Post Type Badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full tracking-wide shadow-sm border border-transparent',
              typeInfo.bgColor,
              typeInfo.color,
              post.type === 'question' && 'border-blue-200',
              post.type === 'discussion' && 'border-purple-200',
              post.type === 'resource' && 'border-green-200',
              post.type === 'strategy' && 'border-orange-200',
              post.type === 'poll' && 'border-pink-200'
            )}
          >
            <span className="text-xs">{typeInfo.icon}</span>
            <span className="hidden sm:inline uppercase">{typeInfo.label}</span>
          </span>

          {/* Pinned Badge */}
          {post.isPinned && (
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full">
              <Pin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">PINNED</span>
            </span>
          )}

          {/* Locked Badge */}
          {post.isLocked && (
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 sm:px-2 py-0.5 rounded-full">
              <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">LOCKED</span>
            </span>
          )}

          {/* Solved Badge for Questions */}
          {post.type === 'question' && post.isSolved && (
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">SOLVED</span>
            </span>
          )}

          {/* Bounty Badge */}
          {post.bounty && post.bounty > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 sm:px-2 py-0.5 rounded-full border border-orange-200">
              💰 {post.bounty}
            </span>
          )}

          {/* Verified Solution Badge */}
          {post.isVerified && (
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 sm:px-2 py-0.5 rounded-full">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">VERIFIED</span>
            </span>
          )}

          {/* Doubt Priority Badges */}
          {post.type === 'question' && !post.isSolved && post.examDate && (() => {
            const daysLeft = differenceInDays(new Date(post.examDate), new Date());
            if (daysLeft >= 0 && daysLeft <= 7) {
              return (
                <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black text-rose-600 bg-rose-100 px-1.5 sm:px-2 py-0.5 rounded-full border border-rose-200">
                  <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-rose-600" />
                  <span className="hidden sm:inline">HIGH PRIORITY</span>
                </span>
              );
            } else if (daysLeft > 7 && daysLeft <= 14) {
              return (
                <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-200">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">PRIORITY</span>
                </span>
              );
            }
            return null;
          })()}

          {/* Tags - Hidden on mobile, shown on sm+ */}
          <div className="hidden sm:flex items-center gap-1">
            {post.tags?.slice(0, 3).map((tag) => (
              <PostTagBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>

        {/* Title - Bigger, bolder, tighter tracking */}
        <Link
          to={`/community/post/${post._id}`}
          className="block text-base sm:text-[1.1rem] font-extrabold tracking-tight leading-snug text-foreground/90 hover:text-primary transition-colors line-clamp-2 mb-2 sm:mb-2.5 z-10 relative"
        >
          {post.title}
        </Link>

        {/* Structured Metadata (Question/Resource) - Compact on mobile */}
        {(post.chapter || post.difficulty || post.questionSource || post.resourceType) && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            {post.chapter && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-semibold bg-muted/60 text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-border/40">
                <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="truncate max-w-[80px] sm:max-w-none">{post.chapter}</span>
              </span>
            )}
            {post.difficulty && (
              <span className={cn(
                "inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-border/40",
                post.difficulty === 'easy' && "bg-emerald-50 text-emerald-700 border-emerald-100",
                post.difficulty === 'medium' && "bg-amber-50 text-amber-700 border-amber-100",
                post.difficulty === 'hard' && "bg-rose-50 text-rose-700 border-rose-100"
              )}>
                {post.difficulty.toUpperCase().slice(0, 4)}
              </span>
            )}
            {post.questionSource && (
              <span className="hidden sm:inline-flex items-center gap-0.5 sm:gap-1 text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                Source: {post.questionSource.slice(0, 20)}
              </span>
            )}
            {post.resourceType && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-indigo-100">
                <GraduationCap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">{post.resourceType.toUpperCase()}</span>
              </span>
            )}
          </div>
        )}

        {/* Body Preview - Shorter on mobile */}
        {hasBody && (
          <div className="mb-3 sm:mb-4 relative z-10">
            <p className={cn(
              'text-[13px] sm:text-[14px] text-muted-foreground/80 leading-relaxed font-medium',
              !isExpanded && 'line-clamp-2'
            )}>
              {isExpanded ? post.body!.replace(/<[^>]*>/g, '') : bodyPreview}
              {!isExpanded && hasMoreContent && '...'}
            </p>
            {hasMoreContent && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] sm:text-xs font-bold text-primary hover:text-primary/80 hover:underline mt-1.5 transition-colors"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Poll Preview */}
        {post.poll && (
          <div className="mb-2 sm:mb-3">
            <PollCard
              postId={post._id}
              poll={post.poll}
              isLocked={post.isLocked}
              compact
            />
          </div>
        )}

        {/* Author + Channel + Time - Compact on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
          <SmartAvatar
            src={post.isAnonymous ? undefined : post.authorId?.profilePicture}
            email={post.isAnonymous ? undefined : post.authorId?.email}
            name={post.isAnonymous ? 'Anonymous' : post.authorId?.name}
            size="sm"
            className="h-4 w-4 sm:h-5 sm:w-5"
          />
          <span className="font-medium text-foreground/70 hover:text-foreground transition-colors truncate max-w-[80px] sm:max-w-none">
            {post.isAnonymous ? 'Anonymous' : post.authorId?.name}
          </span>
          {post.authorId?.progressStats && !post.isAnonymous && (
            <ReputationBadge karma={post.authorId.progressStats.karma} />
          )}
          <span className="opacity-40 hidden sm:inline">·</span>

          {/* Channel Link - Hidden on mobile */}
          {showChannel && post.channelId && (
            <>
              <Link
                to={`/community/channel/${post.channelId.slug}`}
                className="hidden sm:inline-flex items-center gap-1 text-primary hover:underline font-medium"
              >
                {post.channelId.icon && (
                  <img src={post.channelId.icon} alt="" className="h-3 w-3 rounded" />
                )}
                {post.channelId.name}
              </Link>
              <span className="opacity-40 hidden sm:inline">·</span>
            </>
          )}

          {/* Subchannel */}
          {post.subchannelId && (
            <>
              <Link
                to={`/community/channel/${channelSlug || post.channelId?.slug}?subchannel=${post.subchannelId._id}`}
                className="hidden sm:inline hover:text-foreground hover:underline"
              >
                #{post.subchannelId.name}
              </Link>
              <span className="opacity-40 hidden sm:inline">·</span>
            </>
          )}

          <span title={new Date(post.createdAt).toLocaleString()} className="whitespace-nowrap">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).replace('about ', '')}
          </span>
        </div>

        {/* Footer Actions - Icon only on mobile */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Comments */}
          <ActionButton
            as={Link}
            to={`/community/post/${post._id}`}
            icon={<MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            label={`${post.commentCount}`}
            className="sm:hidden"
          />
          <ActionButton
            as={Link}
            to={`/community/post/${post._id}`}
            icon={<MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            label={`${post.commentCount} ${post.commentCount === 1 ? 'comment' : 'comments'}`}
            className="hidden sm:inline-flex"
          />

          {/* Share */}
          <div className="relative">
            <ActionButton
              icon={<Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              label="Share"
              onClick={handleShare}
            />
            {shareTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded font-medium whitespace-nowrap animate-in fade-in duration-200">
                Copied!
              </div>
            )}
          </div>

          {/* Save */}
          <ActionButton
            icon={<Bookmark className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isSaved && "fill-current")} />}
            label={isSaved ? 'Saved' : 'Save'}
            onClick={handleSave}
            active={isSaved}
          />

          {/* Exam-prep actions - Icon only on mobile */}
          {post.type === 'question' && (
            <>
              <ActionButton
                icon={<AlertOctagon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                label="Mistake"
                onClick={() => {
                  navigate('/mistakes', { state: { fromPostId: post._id } });
                  toast.success('Opening Mistake Notebook...');
                }}
                className="sm:hidden"
              />
              <ActionButton
                icon={<Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                label="Flashcard"
                onClick={() => {
                  navigate('/flashcards', { state: { fromPostId: post._id } });
                  toast.success('Create flashcard...');
                }}
                className="sm:hidden"
              />
              <ActionButton
                icon={<AlertOctagon className="h-4 w-4" />}
                label="Add to mistakes"
                onClick={() => {
                  navigate('/mistakes', { state: { fromPostId: post._id } });
                  toast.success('Opening Mistake Notebook with this question highlighted.');
                }}
                className="hidden sm:inline-flex"
              />
              <ActionButton
                icon={<Layers className="h-4 w-4" />}
                label="Save as flashcard"
                onClick={() => {
                  navigate('/flashcards', { state: { fromPostId: post._id } });
                  toast.success('You can now turn this question into a flashcard.');
                }}
                className="hidden sm:inline-flex"
              />
            </>
          )}

          {/* Views - Desktop Only */}
          <span className="hidden sm:inline-flex items-center gap-1 ml-auto text-xs text-muted-foreground">
            {post.viewCount.toLocaleString()} views
          </span>

          {/* More Options / Report */}
          <div className="relative ml-auto">
            <ActionButton
              icon={<MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              label=""
              onClick={() => setReportOpen(!reportOpen)}
              className="ml-auto"
            />
            {reportOpen && (
              <div className="absolute right-0 bottom-full z-20 w-48 sm:w-56 rounded-xl border border-border bg-card shadow-lg p-2.5 sm:p-3 space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Post Options
                </p>
                <button
                  onClick={() => {
                    setReportOpen(false);
                    handleShare();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-muted transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Copy Link
                </button>
                <button
                  onClick={() => {
                    window.open(`/community/post/${post._id}`, '_blank');
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-muted transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Open in New Tab
                </button>
                <hr className="border-border" />
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Report Post</p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-[11px] sm:text-xs rounded-lg border border-border bg-background px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="spam">Spam</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="harassment">Harassment</option>
                  <option value="off_topic">Off-topic</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReportOpen(false)}
                    className="flex-1 text-[11px] sm:text-xs px-2 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    className="flex-1 text-[11px] sm:text-xs px-2 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                  >
                    Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;