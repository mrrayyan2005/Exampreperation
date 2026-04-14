import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/redux/hooks';
import { addRevisionWithSpacedRepetition } from '@/redux/slices/bookSlice';
import {
  CheckCircle,
  Brain,
  Clock,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Sparkles,
  Calendar
} from 'lucide-react';
import { calculateNextRevisionDate, SPACED_REPETITION_INTERVALS } from '@/lib/spacedRepetition';

interface RevisionLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  chapterIndex: number;
  chapterName: string;
  bookTitle: string;
  currentStage: number;
}

type UnderstandingLevel = 'poor' | 'fair' | 'good' | 'excellent';

const UNDERSTANDING_OPTIONS: { value: UnderstandingLevel; label: string; emoji: string; color: string }[] = [
  { value: 'poor', label: 'Struggled', emoji: '😅', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'fair', label: 'Okay', emoji: '😐', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'excellent', label: 'Mastered', emoji: '🤩', color: 'bg-green-100 text-green-700 border-green-200' }
];

export function RevisionLogDialog({
  isOpen,
  onClose,
  bookId,
  chapterIndex,
  chapterName,
  bookTitle,
  currentStage = 0
}: RevisionLogDialogProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [understanding, setUnderstanding] = useState<UnderstandingLevel>('good');
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState([30]); // minutes
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate next revision preview
  const getNextRevisionPreview = () => {
    const selectedOption = UNDERSTANDING_OPTIONS.find(o => o.value === understanding);
    let nextStage = currentStage;

    if (understanding === 'poor') {
      nextStage = 0; // Reset if struggled
    } else {
      nextStage = Math.min(currentStage + 1, 4);
    }

    const nextDate = calculateNextRevisionDate(nextStage);
    const daysInterval = SPACED_REPETITION_INTERVALS[nextStage] || 1;

    return {
      date: nextDate,
      stage: nextStage + 1,
      interval: daysInterval,
      willReset: understanding === 'poor',
      label: selectedOption?.label || ''
    };
  };

  const preview = getNextRevisionPreview();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(addRevisionWithSpacedRepetition({
        bookId,
        chapterIndex,
        revisionData: {
          timeSpent: timeSpent[0],
          notes: notes || undefined,
          understanding
        },
        understanding
      })).unwrap();

      toast({
        title: '✅ Revision Logged!',
        description: `Next review scheduled for ${preview.date.toLocaleDateString()} (${preview.interval} days)`,
      });

      onClose();
      setNotes('');
      setTimeSpent([30]);
      setUnderstanding('good');
    } catch (error) {
      toast({
        title: '❌ Failed to log revision',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Log Revision Session
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{chapterName}</span> from <span className="font-medium">{bookTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Understanding Level */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              How well did you understand this chapter?
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {UNDERSTANDING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setUnderstanding(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    understanding === option.value
                      ? option.color + ' border-current'
                      : 'bg-muted/50 border-transparent hover:bg-muted'
                  }`}
                >
                  <span className="text-2xl mr-2">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Spent Slider */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Time spent: <span className="font-bold">{timeSpent[0]} minutes</span>
            </Label>
            <Slider
              value={timeSpent}
              onValueChange={setTimeSpent}
              min={5}
              max={180}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>180 min</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Session Notes (optional)</Label>
            <Textarea
              placeholder="What did you learn? What was difficult?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Spaced Repetition Preview */}
          <motion.div
            key={understanding}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              preview.willReset
                ? 'bg-amber-50 border-amber-200'
                : 'bg-primary/5 border-primary/20'
            }`}
          >
            <div className="flex items-start gap-3">
              {preview.willReset ? (
                <HelpCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {preview.willReset
                    ? 'Stage will reset due to difficulty'
                    : `Advancing to Stage ${preview.stage} of 5`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Next review: <span className="font-semibold">{preview.date.toLocaleDateString()}</span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on the {preview.interval}-day spaced repetition interval
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Logging...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Log Revision
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
