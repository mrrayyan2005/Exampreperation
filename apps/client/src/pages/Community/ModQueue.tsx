import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getModQueue, resolveReport } from '@/api/communityPhase2';
import { useAppSelector } from '@/redux/hooks';
import { ArrowLeft, ShieldAlert, CheckCircle2, XCircle, MessageSquare, FileText, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const REASON_LABELS: Record<string, string> = {
  spam: '🚫 Spam',
  misinformation: '❌ Misinformation',
  offensive: '🤬 Offensive',
  'off-topic': '📌 Off-topic',
  plagiarism: '📋 Plagiarism',
  'hate-speech': '⚡ Hate Speech',
  other: '❓ Other',
};

const ModQueue: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState('pending');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['mod-queue', slug, activeStatus],
    queryFn: () => getModQueue({ slug: slug!, status: activeStatus }),
    enabled: !!slug,
  });

  const reports: any[] = data?.data || [];

  const resolveMutation = useMutation({
    mutationFn: resolveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mod-queue', slug] });
    },
  });

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center py-20">
        <ShieldAlert className="h-12 w-12 text-destructive/50 mx-auto mb-3" />
        <p className="font-semibold text-lg">Access Denied</p>
        <p className="text-muted-foreground text-sm mt-1">
          You must be a moderator or owner to access this page.
        </p>
        <button
          onClick={() => navigate(`/community/channel/${slug}`)}
          className="mt-4 text-primary hover:underline text-sm"
        >
          ← Back to channel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/community/channel/${slug}`)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Moderation Queue
          </h1>
          <p className="text-xs text-muted-foreground">Channel: {slug}</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {['pending', 'actioned', 'dismissed'].map((s) => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
              activeStatus === s
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Reports */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/30 animate-pulse border border-border" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/60 bg-card">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
          <p className="font-semibold">All clear!</p>
          <p className="text-sm text-muted-foreground mt-1">No {activeStatus} reports.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report: any) => (
            <div
              key={report._id}
              className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
            >
              {/* Report header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {report.targetType === 'post' ? (
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-xs text-muted-foreground capitalize">
                    {report.targetType} report
                  </span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                    {REASON_LABELS[report.reason] || report.reason}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Target content preview */}
              {report.target && (
                <div className="rounded-lg bg-muted/40 px-3 py-2">
                  {report.targetType === 'post' ? (
                    <Link
                      to={`/community/post/${report.targetId}`}
                      className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {report.target.title}
                    </Link>
                  ) : (
                    <p className="text-sm line-clamp-2">{report.target.body}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    by {report.target.authorId?.name || 'Unknown'}
                  </p>
                </div>
              )}

              {/* Reporter details */}
              {report.details && (
                <p className="text-xs text-muted-foreground italic">
                  "{report.details}"
                </p>
              )}

              {/* Actions (only for pending) */}
              {report.status === 'pending' && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() =>
                      resolveMutation.mutate({
                        reportId: report._id,
                        status: 'actioned',
                        actionTaken: 'Content removed by moderator',
                      })
                    }
                    disabled={resolveMutation.isPending}
                    className="flex items-center gap-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {resolveMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    Remove Content
                  </button>
                  <button
                    onClick={() =>
                      resolveMutation.mutate({
                        reportId: report._id,
                        status: 'dismissed',
                      })
                    }
                    disabled={resolveMutation.isPending}
                    className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Dismiss
                  </button>
                </div>
              )}

              {/* Resolution badge */}
              {report.status !== 'pending' && (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-semibold',
                      report.status === 'actioned'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {report.status === 'actioned' ? '✓ Content Removed' : '○ Dismissed'}
                  </span>
                  {report.reviewedBy && (
                    <span className="text-[10px] text-muted-foreground">
                      by {report.reviewedBy.name}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModQueue;
