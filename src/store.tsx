import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { GromoData, SessionLog, SetEntry, ExerciseDef } from './types';
import { buildSeed } from './seed';
import { isCompleted } from './progression';
import { newId } from './id';

const STORAGE_KEY = 'gromo';

function load(): GromoData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GromoData;
      if (parsed && parsed.version === 1) return parsed;
    }
  } catch {
    // fall through to seed
  }
  return buildSeed();
}

function save(data: GromoData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface StoreApi {
  data: GromoData;
  logSession: (ex: ExerciseDef, dayId: string, sets: SetEntry[]) => void;
  updateSession: (logId: string, ex: ExerciseDef, sets: SetEntry[]) => void;
  deleteSession: (logId: string) => void;
  saveExercise: (dayId: string, ex: ExerciseDef, weight?: number) => void;
  deleteExercise: (dayId: string, exerciseId: string) => void;
  moveExercise: (dayId: string, exerciseId: string, delta: -1 | 1) => void;
  clearHistory: (exerciseId?: string) => void;
  replaceData: (data: GromoData) => void;
  resetToSeed: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GromoData>(load);

  useEffect(() => {
    save(data);
  }, [data]);

  const logSession = useCallback((ex: ExerciseDef, dayId: string, sets: SetEntry[]) => {
    setData((prev) => {
      const completed = isCompleted(ex, sets);
      const log: SessionLog = {
        id: newId(),
        exerciseId: ex.id,
        dayId,
        performedOn: new Date().toISOString(),
        sets,
        completed,
      };

      const workingWeight = { ...prev.workingWeight };
      // Earned a level-up: bump the working weight for next time.
      if (completed && ex.kind === 'weighted-progress' && ex.increment) {
        const base = workingWeight[ex.id] ?? ex.startWeight ?? 0;
        workingWeight[ex.id] = base + ex.increment;
      }

      return { ...prev, logs: [...prev.logs, log], workingWeight };
    });
  }, []);

  // Edit a past session's sets. Recomputes the per-log `completed` flag so the
  // level-up chip stays accurate, but deliberately does NOT recompute working
  // weight — editing fixes the record, it doesn't rewrite progression history.
  const updateSession = useCallback((logId: string, ex: ExerciseDef, sets: SetEntry[]) => {
    setData((prev) => ({
      ...prev,
      logs: prev.logs.map((l) =>
        l.id === logId ? { ...l, sets, completed: isCompleted(ex, sets) } : l,
      ),
    }));
  }, []);

  const deleteSession = useCallback((logId: string) => {
    setData((prev) => ({ ...prev, logs: prev.logs.filter((l) => l.id !== logId) }));
  }, []);

  // Add a new exercise to the end of a day, or update an existing one in place.
  // `weight` sets the current working weight (weighted kinds only). Past logs are
  // left untouched, same as updateSession.
  const saveExercise = useCallback((dayId: string, ex: ExerciseDef, weight?: number) => {
    setData((prev) => {
      const exists = prev.exercises.some((e) => e.id === ex.id);
      const exercises = exists ? prev.exercises.map((e) => (e.id === ex.id ? ex : e)) : [...prev.exercises, ex];
      const days = exists
        ? prev.days
        : prev.days.map((d) => (d.id === dayId ? { ...d, exerciseIds: [...d.exerciseIds, ex.id] } : d));

      const workingWeight = { ...prev.workingWeight };
      if (ex.kind === 'bodyweight') delete workingWeight[ex.id];
      else if (weight != null) workingWeight[ex.id] = weight;

      return { ...prev, exercises, days, workingWeight };
    });
  }, []);

  // Remove an exercise from its day and drop its definition, logs and working weight.
  const deleteExercise = useCallback((dayId: string, exerciseId: string) => {
    setData((prev) => {
      const workingWeight = { ...prev.workingWeight };
      delete workingWeight[exerciseId];
      return {
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, exerciseIds: d.exerciseIds.filter((id) => id !== exerciseId) } : d,
        ),
        exercises: prev.exercises.filter((e) => e.id !== exerciseId),
        logs: prev.logs.filter((l) => l.exerciseId !== exerciseId),
        workingWeight,
      };
    });
  }, []);

  // Shift an exercise one slot up (-1) or down (+1) within its day.
  const moveExercise = useCallback((dayId: string, exerciseId: string, delta: -1 | 1) => {
    setData((prev) => ({
      ...prev,
      days: prev.days.map((d) => {
        if (d.id !== dayId) return d;
        const from = d.exerciseIds.indexOf(exerciseId);
        const to = from + delta;
        if (from < 0 || to < 0 || to >= d.exerciseIds.length) return d;
        const exerciseIds = [...d.exerciseIds];
        [exerciseIds[from], exerciseIds[to]] = [exerciseIds[to], exerciseIds[from]];
        return { ...d, exerciseIds };
      }),
    }));
  }, []);

  // Delete logged sessions for one exercise, or for every exercise when no id is
  // given. The program is kept, and each cleared exercise goes back to its
  // starting weight since the progression that raised it is gone.
  const clearHistory = useCallback((exerciseId?: string) => {
    setData((prev) => {
      const cleared = (id: string) => exerciseId == null || id === exerciseId;
      const workingWeight = { ...prev.workingWeight };
      for (const ex of prev.exercises) {
        if (cleared(ex.id) && ex.startWeight != null) workingWeight[ex.id] = ex.startWeight;
      }
      return { ...prev, logs: prev.logs.filter((l) => !cleared(l.exerciseId)), workingWeight };
    });
  }, []);

  const replaceData = useCallback((next: GromoData) => setData(next), []);
  const resetToSeed = useCallback(() => setData(buildSeed()), []);

  return (
    <StoreContext.Provider
      value={{
        data,
        logSession,
        updateSession,
        deleteSession,
        saveExercise,
        deleteExercise,
        moveExercise,
        clearHistory,
        replaceData,
        resetToSeed,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
