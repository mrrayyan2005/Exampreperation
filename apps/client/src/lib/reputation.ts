export interface ReputationLevel {
  level: number;
  label: string;
  color: string;
  minKarma: number;
}

export const REPUTATION_LEVELS: ReputationLevel[] = [
  { level: 1, label: 'Aspirant', color: 'text-slate-500 bg-slate-100 dark:bg-slate-900/30', minKarma: 0 },
  { level: 2, label: 'Scholar', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', minKarma: 50 },
  { level: 3, label: 'Specialist', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', minKarma: 200 },
  { level: 4, label: 'Elite', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', minKarma: 500 },
  { level: 5, label: 'Mentor', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', minKarma: 1000 },
  { level: 6, label: 'Legend', color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30', minKarma: 2500 },
];

export function getReputationLevel(karma: number = 0): ReputationLevel {
  for (let i = REPUTATION_LEVELS.length - 1; i >= 0; i--) {
    if (karma >= REPUTATION_LEVELS[i].minKarma) {
      return REPUTATION_LEVELS[i];
    }
  }
  return REPUTATION_LEVELS[0];
}

export function getNumericalLevel(karma: number = 0): number {
  // Simple square root based scaling: sqrt(karma/5)
  return Math.floor(Math.sqrt(karma / 5)) + 1;
}
