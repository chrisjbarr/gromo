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

  const replaceData = useCallback((next: GromoData) => setData(next), []);
  const resetToSeed = useCallback(() => setData(buildSeed()), []);

  return (
    <StoreContext.Provider value={{ data, logSession, replaceData, resetToSeed }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
