import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Share2,
  Bookmark,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import type { RootState } from '@/redux/store';
import type { Post } from '@/redux/slices/communitySlice';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ForumPostCardProps {
  post: Post;
  userVoteValue?: number;
  onVote: (post: Post, vote: number) => void;
  onDeletePost?: (post: Post) => Promise<boolean>;
  onSelectPost?: (post: Post) => void;
  isSinglePost?: boolean;
  showCommunityInfo?: boolean;
}

export const ForumPostCard = ({
  post,
  userVoteValue = 0,
  onVote,
  onDeletePost,
  onSelectPost,
  isSinglePost = false,
  showCommunityInfo = false,
}: ForumPostCardProps) => {
  const [loadingImage, setLoadingImage] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const isCreator = user?.id === post.creatorId;

  const handleVote = (e: React.MouseEvent, vote: number) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    onVote(post, vote);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeletePost) return;

    setLoadingDelete(true);
    const success = await onDeletePost(post);
    setLoadingDelete(false);

    if (!success) {
      toast.error('Failed to delete post');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/community/post/${post._id}`);
    toast.success('Link copied to clipboard');
  };

  return (
    <motion.div
      initial={!isSinglePost ? { opacity: 0, y: 10 } : false}
      animate={!isSinglePost ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.3 }}
      className={cn(
        'group flex flex-col bg-card border border-border/40 rounded-2xl overflow-hidden transition-all duration-300',
        !isSinglePost && 'hover:shadow-lg hover:border-primary/20 cursor-pointer hover:-translate-y-0.5',
        isSinglePost && 'rounded-b-none border-b-0 shadow-none'
      )}
      onClick={() => onSelectPost && onSelectPost(post)}
    >
      {/* Content Area */}
      <div className="flex-1 p-4 sm:p-5">
        {/* Header - Meta Info */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {showCommunityInfo && (
              <Link
                to={`/community/channel/${post.communitySlug}`}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10 text-primary font-semibold"
                onClick={(e) => e.stopPropagation()}
              >
                {post.communityImageURL ? (
                  <img src={post.communityImageURL} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">f/</div>
                )}
                <span>f/{post.communityName}</span>
              </Link>
            )}

            <div className="flex items-center gap-1.5">
              <span>Posted by</span>
              <Link
                to={`/profile/${post.creatorId}`}
                className="font-medium text-foreground/80 hover:text-primary hover:underline transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                u/{post.creatorName}
              </Link>
            </div>
            <span className="text-border">•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>

          {!isSinglePost && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
               <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {/* Body Text */}
        {post.body && (
          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 mb-4">
            {post.body}
          </p>
        )}

        {/* Media */}
        {post.imageURL && (
          <div className="mt-3 mb-4 rounded-xl overflow-hidden border border-border/50 bg-muted/20 relative">
            {loadingImage && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img
              src={post.imageURL}
              alt="Post attachment"
              className={cn(
                'max-h-[400px] w-auto mx-auto object-contain transition-opacity duration-500',
                loadingImage ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={() => setLoadingImage(false)}
            />
          </div>
        )}
      </div>

      {/* Footer / Actions Bar */}
      <div className="px-4 py-3 sm:px-5 bg-muted/10 border-t border-border/40 flex items-center gap-2 sm:gap-4 flex-wrap">
        {/* Modern Vote Control */}
        <div className="flex items-center bg-background border border-border/50 rounded-full shadow-sm overflow-hidden" onClick={e => e.stopPropagation()}>
          <button
            onClick={(e) => handleVote(e, 1)}
            className={cn(
              'px-3 py-1.5 hover:bg-muted/50 transition-colors flex items-center justify-center',
              userVoteValue === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:text-orange-500'
            )}
          >
            <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
          </button>
          
          <span className={cn(
            'px-1 min-w-[2rem] text-center text-sm font-black',
            userVoteValue === 1 ? 'text-orange-500' : userVoteValue === -1 ? 'text-blue-500' : 'text-foreground'
          )}>
            {post.voteStatus}
          </span>

          <button
            onClick={(e) => handleVote(e, -1)}
            className={cn(
              'px-3 py-1.5 hover:bg-muted/50 transition-colors flex items-center justify-center',
              userVoteValue === -1 ? 'text-blue-500 bg-blue-500/10' : 'text-muted-foreground hover:text-blue-500'
            )}
          >
            <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Comments */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted/50 text-muted-foreground text-sm font-medium transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelectPost && onSelectPost(post);
          }}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{post.numberOfComments}</span>
          <span className="hidden sm:inline">Comments</span>
        </button>

        {/* Share */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted/50 text-muted-foreground text-sm font-medium transition-colors"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Save */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted/50 text-muted-foreground text-sm font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Bookmark className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <div className="flex-1" />

        {/* Delete */}
        {isCreator && onDeletePost && (
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-500/10 text-red-500/70 hover:text-red-500 text-sm font-medium transition-colors"
            onClick={handleDelete}
            disabled={loadingDelete}
          >
            {loadingDelete ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ForumPostCard;
