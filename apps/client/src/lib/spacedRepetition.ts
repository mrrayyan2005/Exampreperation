/**
 * Spaced Repetition Scheduler
 * Based on the Forgetting Curve - optimal intervals: 1, 3, 7, 14, 30 days
 */

// Intervals in days for each stage (0-indexed)
export const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30];

export interface SpacedRepetitionConfig {
  intervals: number[];
  maxStage: number;
}

export const DEFAULT_CONFIG: SpacedRepetitionConfig = {
  intervals: SPACED_REPETITION_INTERVALS,
  maxStage: 5
};

/**
 * Calculate the next revision date based on current stage
 */
export function calculateNextRevisionDate(
  currentStage: number,
  fromDate: Date = new Date()
): Date {
  const interval = SPACED_REPETITION_INTERVALS[Math.min(currentStage, SPACED_REPETITION_INTERVALS.length - 1)];
  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate;
}

/**
 * Advance to the next stage after successful revision
 */
export function advanceStage(currentStage: number, maxStage: number = 5): number {
  return Math.min(currentStage + 1, maxStage);
}

/**
 * Reset stage if revision was difficult/poor
 */
export function resetStage(): number {
  return 0;
}

/**
 * Check if a chapter is due for revision today
 */
export function isDueForRevision(nextRevisionDate: string | undefined): boolean {
  if (!nextRevisionDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(nextRevisionDate);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate <= today;
}

/**
 * Get days until next revision (negative = overdue)
 */
export function getDaysUntilRevision(nextRevisionDate: string | undefined): number {
  if (!nextRevisionDate) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(nextRevisionDate);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get formatted string for revision status
 */
export function getRevisionStatusText(daysUntil: number): string {
  if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
  if (daysUntil === 0) return 'Due today';
  if (daysUntil === 1) return 'Due tomorrow';
  return `Due in ${daysUntil} days`;
}

/**
 * Initialize a new chapter with spaced repetition
 */
export function initializeSpacedRepetition(): {
  nextRevisionDate: string;
  revisionStage: number;
  isDueForRevision: boolean;
} {
  const nextDate = calculateNextRevisionDate(0);
  return {
    nextRevisionDate: nextDate.toISOString(),
    revisionStage: 0,
    isDueForRevision: false
  };
}

/**
 * Process a revision event and update spaced repetition data
 */
export function processRevision(
  currentStage: number,
  understanding: 'poor' | 'fair' | 'good' | 'excellent',
  maxStage: number = 5
): {
  nextRevisionDate: string;
  revisionStage: number;
  isDueForRevision: boolean;
} {
  let newStage: number;

  // If understanding was poor, reset to stage 0
  if (understanding === 'poor') {
    newStage = resetStage();
  } else {
    // Otherwise advance to next stage
    newStage = advanceStage(currentStage, maxStage);
  }

  const nextDate = calculateNextRevisionDate(newStage);

  return {
    nextRevisionDate: nextDate.toISOString(),
    revisionStage: newStage,
    isDueForRevision: false
  };
}

/**
 * Sort chapters by priority for revision
 * Overdue > Due today > Due soon > Not due
 */
export function sortByRevisionPriority<T extends { nextRevisionDate?: string; revisionStage?: number }>(
  chapters: T[]
): T[] {
  return [...chapters].sort((a, b) => {
    const daysA = getDaysUntilRevision(a.nextRevisionDate);
    const daysB = getDaysUntilRevision(b.nextRevisionDate);

    // Overdue chapters first (negative days)
    if (daysA < 0 && daysB >= 0) return -1;
    if (daysB < 0 && daysA >= 0) return 1;

    // Then sort by days until due
    return daysA - daysB;
  });
}

/**
 * Group chapters by revision urgency
 */
export function groupByUrgency<T extends { nextRevisionDate?: string }>(
  chapters: T[]
): {
  overdue: T[];
  dueToday: T[];
  dueThisWeek: T[];
  upcoming: T[];
} {
  return chapters.reduce(
    (acc, chapter) => {
      const days = getDaysUntilRevision(chapter.nextRevisionDate);

      if (days < 0) {
        acc.overdue.push(chapter);
      } else if (days === 0) {
        acc.dueToday.push(chapter);
      } else if (days <= 7) {
        acc.dueThisWeek.push(chapter);
      } else {
        acc.upcoming.push(chapter);
      }

      return acc;
    },
    {
      overdue: [] as T[],
      dueToday: [] as T[],
      dueThisWeek: [] as T[],
      upcoming: [] as T[]
    }
  );
}
