import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { summarizePost, getAnswerHints } from '@/api/communityPhase2';
import { Sparkles, ChevronDown, ChevronUp, Loader2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISummaryCardProps {
  postId: string;
  postType: string;
  existingSummary?: string;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  postId,
  postType,
  existingSummary,
}) => {
  const [expanded, setExpanded] = useState(!!existingSummary);
  const [summary, setSummary] = useState<string | null>(existingSummary || null);
  const [hints, setHints] = useState<string[] | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [hintsLoading, setHintsLoading] = useState(false);

  const summarizeMutation = useMutation({
    mutationFn: () => summarizePost(postId),
    onSuccess: (data: any) => {
      setSummary(data?.summary ?? null);
      setExpanded(true);
    },
  });

  const loadHints = async () => {
    if (hints) {
      setShowHints((v) => !v);
      return;
    }
    setHintsLoading(true);
    try {
      const data = await getAnswerHints(postId);
      setHints(data.hints);
      setShowHints(true);
    } catch (e) {
      // silently fail
    } finally {
      setHintsLoading(false);
    }
  };

  const isQuestion = postType === 'question';

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer"
        onClick={() => {
          if (!summary) {
            summarizeMutation.mutate();
          } else {
            setExpanded((v) => !v);
          }
        }}
      >
        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-sm font-semibold text-primary flex-1">AI Summary</span>
        {summarizeMutation.isPending ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        ) : expanded ? (
          <ChevronUp className="h-4 w-4 text-primary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Summary */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {summary ? (
            <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
          ) : summarizeMutation.isError ? (
            <p className="text-sm text-destructive">
              Could not generate summary. AI features may not be configured.
            </p>
          ) : null}

          {/* Answer Hints for question posts */}
          {isQuestion && (
            <div className="border-t border-primary/10 pt-3">
              <button
                onClick={loadHints}
                disabled={hintsLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {hintsLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Lightbulb className="h-3.5 w-3.5" />
                )}
                {showHints ? 'Hide' : 'Get'} AI Answer Hints
              </button>

              {showHints && hints && (
                <ol className="mt-3 space-y-2">
                  {hints.map((hint, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-foreground/80 leading-relaxed">{hint}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
