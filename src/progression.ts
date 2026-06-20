import type { ExerciseDef, SessionLog, SetEntry } from './types';

export type Trend = 'up' | 'flat' | 'down' | 'none';

// A weighted-progress exercise is "completed" at its weight when every set
// reached the top of the rep range. That earns the +increment next session.
export function isCompleted(ex: ExerciseDef, sets: SetEntry[]): boolean {
  if (ex.kind !== 'weighted-progress') return false;
  if (sets.length < ex.sets) return false;
  return sets.slice(0, ex.sets).every((s) => (s.reps ?? 0) >= ex.repHigh);
}

// Total work done in a session, used for the trend comparison.
//  - weighted: sum of reps * weight
//  - bodyweight(reps): sum of reps
//  - bodyweight(time): sum of seconds
export function sessionScore(ex: ExerciseDef, sets: SetEntry[]): number {
  if (ex.kind === 'bodyweight' && ex.metric === 'time') {
    return sets.reduce((acc, s) => acc + (s.seconds ?? 0), 0);
  }
  if (ex.kind === 'bodyweight') {
    return sets.reduce((acc, s) => acc + (s.reps ?? 0), 0);
  }
  return sets.reduce((acc, s) => acc + (s.reps ?? 0) * (s.weight ?? 0), 0);
}

// Most recent two logs for an exercise (newest first), used to compute the trend.
function recentLogs(logs: SessionLog[], exerciseId: string): SessionLog[] {
  return logs
    .filter((l) => l.exerciseId === exerciseId)
    .sort((a, b) => b.performedOn.localeCompare(a.performedOn));
}

export function trendFor(ex: ExerciseDef, logs: SessionLog[]): Trend {
  const recent = recentLogs(logs, ex.id);
  if (recent.length === 0) return 'none';

  const latest = recent[0];
  if (latest.completed) return 'up'; // earned a level-up

  if (recent.length < 2) return 'none';
  const prev = recent[1];

  const a = sessionScore(ex, latest.sets);
  const b = sessionScore(ex, prev.sets);
  if (a > b) return 'up';
  if (a < b) return 'down';
  return 'flat';
}

export function lastLog(logs: SessionLog[], exerciseId: string): SessionLog | undefined {
  return recentLogs(logs, exerciseId)[0];
}

// "today" / "5 days ago" / "3 weeks ago" — relative phrasing for a past date.
export function relativeWhen(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 9) return `${weeks} weeks ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

// Human-readable summary of a logged session's sets.
//  - time:        "20s · 25s · 30s"
//  - bodyweight:  "12 · 12 · 10"
//  - weighted, all sets same weight:  "11, 11, 10, 10 @ 105 lbs"
//  - weighted, mixed weights (drop sets): "10×35 · 10×20" (per-set)
export function formatSets(ex: ExerciseDef, sets: SetEntry[]): string {
  if (ex.kind === 'bodyweight' && ex.metric === 'time') {
    return sets.map((s) => `${s.seconds ?? 0}s`).join(' · ');
  }
  if (ex.kind === 'bodyweight') {
    return sets.map((s) => `${s.reps ?? 0}`).join(' · ');
  }
  const weights = sets.map((s) => s.weight ?? 0);
  const allSame = weights.every((w) => w === weights[0]);
  if (allSame) {
    const reps = sets.map((s) => s.reps ?? 0).join(', ');
    return `${reps} @ ${weights[0]} lbs`;
  }
  return sets.map((s) => `${s.reps ?? 0}×${s.weight ?? 0}`).join(' · ');
}

// Format the target as "4 × 8-10" (reps) or "3 × 20-30 sec" (time).
export function formatTarget(ex: ExerciseDef): string {
  const range = ex.repLow === ex.repHigh ? `${ex.repLow}` : `${ex.repLow}-${ex.repHigh}`;
  const unit = ex.kind === 'bodyweight' && ex.metric === 'time' ? ' sec' : '';
  return `${ex.sets} × ${range}${unit}`;
}
