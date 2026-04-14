import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment, markBestAnswer, verifyExpertAnswer } from '@/api/community';
import { castReport } from '@/api/communityPhase2';
import { VoteButton } from '@/components/Community/VoteButton';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Reply, ChevronDown, ChevronUp, Flag, Sparkles, Ghost } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/redux/hooks';
import { ReputationBadge } from '@/components/Community/ReputationBadge';

interface Comment {
  _id: string;
  body: string;
  authorId: { 
    _id: string; 
    name: string; 
    profilePicture?: string; 
    email?: string;
    progressStats?: {
      karma: number;
    }
  };
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: number;
  isBestAnswer: boolean;
  isExpertAnswer: boolean;
  isAnonymous: boolean;
  depth: number;
  childCount: number;
  replies?: Comment[];
  createdAt: string;
}

interface CommentItemProps {
  comment: Comment;
  postAuthorId?: string;
  postId: string;
  depth?: number;
  isModerator?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postAuthorId, postId, depth = 0, isModerator }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [repliesOpen, setRepliesOpen] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportSent, setReportSent] = useState(false);
  const { user } = useAppSelector((s) => s.auth);
  const queryClient = useQueryClient();

  const handleReport = async () => {
    try {
      await castReport({ targetId: comment._id, targetType: 'comment', reason: reportReason });
      setReportSent(true);
      setTimeout(() => { setReportOpen(false); setReportSent(false); }, 1500);
    } catch { /* ignore */ }
  };

  const replyMutation = useMutation({
    mutationFn: (data: { body: string; isAnonymous: boolean }) =>
      createComment({ postId, parentId: comment._id, ...data }),
    onSuccess: () => {
      setReplyText('');
      setShowReply(false);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const bestAnswerMutation = useMutation({
    mutationFn: () => markBestAnswer(comment._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });

  const verifyExpertMutation = useMutation({
    mutationFn: () => verifyExpertAnswer(comment._id, !comment.isExpertAnswer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  return (
    <div className={cn('group', depth > 0 && 'border-l-2 border-border/40 pl-4 ml-2')}>
      {/* Comment body */}
      <div
        className={cn(
          'rounded-lg p-3 transition-colors',
          comment.isBestAnswer && 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800',
          comment.isExpertAnswer && !comment.isBestAnswer && 'bg-primary/5 border border-primary/20',
          !comment.isBestAnswer && !comment.isExpertAnswer && 'hover:bg-muted/30'
        )}
      >
        {/* Special headers */}
        <div className="flex items-center gap-2 mb-2">
          {comment.isBestAnswer && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3" />
              Best Answer
            </div>
          )}
          {comment.isExpertAnswer && (
            <div className="flex items-center gap-1 text-primary text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Expert Answer
            </div>
          )}
        </div>

        {/* Author + time */}
        <div className="flex items-center gap-2 mb-2">
          <SmartAvatar
            src={comment.isAnonymous ? undefined : comment.authorId?.profilePicture}
            email={comment.isAnonymous ? undefined : comment.authorId?.email}
            name={comment.isAnonymous ? 'A' : comment.authorId?.name}
            size="sm"
            className="h-6 w-6"
          />
          <span className="text-sm font-semibold">
            {comment.isAnonymous ? 'Anonymous Student' : comment.authorId?.name}
          </span>
          {comment.authorId?.progressStats && !comment.isAnonymous && (
            <ReputationBadge karma={comment.authorId.progressStats.karma} />
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Body */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">{comment.body}</p>

        {/* Actions row */}
        <div className="flex items-center gap-4">
          <VoteButton
            targetId={comment._id}
            targetType="comment"
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            userVote={comment.userVote}
            queryKey={['comments', postId]}
            compact
          />

          {depth < 2 && (
            <button
              onClick={() => setShowReply((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          )}

          {/* Mark best answer (only post author can do this) */}
          {user?.id === postAuthorId && !comment.isBestAnswer && (
            <button
              onClick={() => bestAnswerMutation.mutate()}
              className="text-xs text-green-600 hover:text-green-700 transition-colors font-medium"
            >
              ✓ Mark as Best Answer
            </button>
          )}

          {/* Expert Verify (Moderators) */}
          {isModerator && (
            <button
              onClick={() => verifyExpertMutation.mutate()}
              className={cn(
                "text-xs font-medium transition-colors hover:opacity-80 flex items-center gap-1",
                comment.isExpertAnswer ? "text-primary bg-primary/10 px-1.5 py-0.5 rounded" : "text-muted-foreground"
              )}
            >
              <Sparkles className="h-3 w-3" />
              {comment.isExpertAnswer ? 'Expert Verified' : 'Verify Expert'}
            </button>
          )}

          {/* Report comment */}
          <div className="relative ml-auto">
            <button
              onClick={() => setReportOpen((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              title="Report comment"
            >
              <Flag className="h-3 w-3" />
            </button>
            {reportOpen && (
              <div className="absolute right-0 bottom-5 z-20 w-48 rounded-xl border border-border bg-card shadow-lg p-3 space-y-2">
                {reportSent ? (
                  <p className="text-xs text-green-600 font-medium text-center py-1">✓ Reported</p>
                ) : (
                  <>
                    <p className="text-xs font-semibold">Report comment</p>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full text-xs rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                    >
                      <option value="spam">Spam</option>
                      <option value="harassment">Harassment</option>
                      <option value="misinformation">Misinformation</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => setReportOpen(false)} className="flex-1 text-xs px-2 py-1 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
                      <button onClick={handleReport} className="flex-1 text-xs px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium">Submit</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Inline reply box */}
        {showReply && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowReply(false)}
                className="text-xs text-muted-foreground hover:text-foreground px-3 py-1"
              >
                Cancel
              </button>
              <button
                disabled={!replyText.trim() || replyMutation.isPending}
                onClick={() => replyMutation.mutate({ body: replyText, isAnonymous: false })}
                className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors font-medium"
              >
                {replyMutation.isPending ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setRepliesOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 ml-2 transition-colors"
          >
            {repliesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
          {repliesOpen && (
            <div className="space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postAuthorId={postAuthorId}
                  postId={postId}
                  depth={depth + 1}
                  isModerator={isModerator}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CommentThreadProps {
  comments: Comment[];
  postId: string;
  postAuthorId?: string;
  isLoading?: boolean;
  typingUsers?: Record<string, number>;
  onTyping?: () => void;
  isModerator?: boolean;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  postId,
  postAuthorId,
  isLoading,
  typingUsers = {},
  onTyping,
  isModerator,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { user } = useAppSelector((s) => s.auth);
  const queryClient = useQueryClient();

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    onTyping?.();
  };

  const typingArray = Object.keys(typingUsers).filter(username => username !== user?.name);

  const commentMutation = useMutation({
    mutationFn: (data: { body: string; isAnonymous: boolean }) => createComment({ postId, ...data }),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  return (
    <div className="space-y-6">
      {/* New comment input */}
      {user && (
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <p className="text-sm font-semibold">Share your thoughts</p>
          <textarea
            value={newComment}
            onChange={handleTyping}
            placeholder="Write a comment, share resources, or ask a follow-up..."
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {typingArray.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>
                {typingArray.length === 1 
                  ? `${typingArray[0]} is typing...` 
                  : `${typingArray.length} users are typing...`}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                isAnonymous 
                  ? "bg-slate-900 text-white" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Ghost className="h-3.5 w-3.5" />
              {isAnonymous ? "Posting Anonymously" : "Post as me"}
            </button>
            <button
              disabled={!newComment.trim() || commentMutation.isPending}
              onClick={() => commentMutation.mutate({ body: newComment, isAnonymous })}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border/40 p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircleIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              postAuthorId={postAuthorId}
              postId={postId}
              isModerator={isModerator}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Inline icon to avoid import issues
const MessageCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);
