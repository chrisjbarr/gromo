import type { GromoData, SessionLog, SetEntry } from './types';
import { buildSeed } from './seed';
import { isCompleted } from './progression';

// Generates a few weeks of plausible history on top of a fresh seed, so the
// trends / arrows / sparklines have something to show. Deterministic — no RNG.

// Day offsets (days ago) for ~6 weekly sessions, oldest first.
const WEEKS = [42, 35, 28, 21, 14, 7];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
}

export function demoData(): GromoData {
  const data = buildSeed();
  const logs: SessionLog[] = [];

  // Pick a representative subset across the days so several exercises show trends.
  const demoExerciseIds = [
    'bench-press',
    'cable-chest-press',
    'lat-pulldown',
    'db-shrugs',
    'hyper-leg-extension',
    'ez-bar-curl',
    'ball-plank',
    'reverse-hyper',
  ];

  for (const exId of demoExerciseIds) {
    const ex = data.exercises.find((e) => e.id === exId);
    if (!ex) continue;
    const dayId = data.days.find((d) => d.exerciseIds.includes(exId))?.id ?? '';
    let weight = ex.startWeight ?? 0;
    let reps = ex.repLow; // climb from the bottom of the range

    WEEKS.forEach((daysAgo, week) => {
      const sets: SetEntry[] = Array.from({ length: ex.sets }, () => {
        if (ex.kind === 'bodyweight' && ex.metric === 'time') return { seconds: reps * 2 };
        if (ex.kind === 'bodyweight') return { reps };
        return { reps, weight };
      });

      const completed = isCompleted(ex, sets);
      logs.push({
        id: `demo-${exId}-${week}`,
        exerciseId: exId,
        dayId,
        performedOn: isoDaysAgo(daysAgo),
        sets,
        completed,
      });

      // Mirror the real app: hitting the top of the range levels you up and
      // resets reps to the bottom at the new weight. Otherwise climb by one.
      if (completed && ex.kind === 'weighted-progress' && ex.increment) {
        weight += ex.increment;
        reps = ex.repLow;
      } else {
        reps = Math.min(ex.repHigh, reps + 1);
      }
    });

    if (ex.startWeight != null) data.workingWeight[exId] = weight;
  }

  return { ...data, logs };
}
