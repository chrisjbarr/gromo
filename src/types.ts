export type ExerciseKind = 'weighted-progress' | 'weighted-static' | 'bodyweight';

// Only meaningful when kind === 'bodyweight'.
export type BodyweightMetric = 'reps' | 'time';

export interface ExerciseDef {
  id: string;
  name: string;
  kind: ExerciseKind;
  sets: number;
  repLow: number;
  repHigh: number;
  startWeight?: number; // weighted kinds
  increment?: number; // weighted-progress only (5 | 2.5)
  metric?: BodyweightMetric; // bodyweight only
  note?: string; // coaching cue from the program
}

export interface DayDef {
  id: string;
  name: string; // "Upper Push"
  subtitle?: string; // "Chest · Shoulders · Triceps"
  exerciseIds: string[];
}

export interface SetEntry {
  reps?: number; // weighted + bodyweight(reps)
  weight?: number; // weighted kinds
  seconds?: number; // bodyweight(time)
}

export interface SessionLog {
  id: string;
  exerciseId: string;
  dayId: string;
  performedOn: string; // ISO date
  sets: SetEntry[];
  completed: boolean; // all sets hit repHigh (weighted-progress)
}

export interface GromoData {
  version: 1;
  days: DayDef[];
  exercises: ExerciseDef[];
  logs: SessionLog[];
  workingWeight: Record<string, number>; // current weight per exercise id
}
