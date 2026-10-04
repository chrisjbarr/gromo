import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Header, PrimaryButton, Stepper } from '../components';
import { formatTarget, isCompleted, lastLog, formatSets, relativeWhen } from '../progression';
import type { SetEntry, ExerciseDef } from '../types';

// Reps default to the last session's reps for that set, else the middle of the range.
// After a level-up (last session completed the range) we reset to the bottom of the
// range, since the weight just went up and last time's high reps no longer apply.
function defaultReps(ex: ExerciseDef, setIndex: number, lastSets?: SetEntry[], leveledUp?: boolean): number {
  if (leveledUp) return ex.repLow;
  const prev = lastSets?.[setIndex]?.reps;
  if (prev != null) return prev;
  return Math.round((ex.repLow + ex.repHigh) / 2);
}

function defaultSeconds(ex: ExerciseDef, setIndex: number, lastSets?: SetEntry[]): number {
  const prev = lastSets?.[setIndex]?.seconds;
  if (prev != null) return prev;
  return Math.round((ex.repLow + ex.repHigh) / 2);
}

// Build the initial set rows, pre-filled and ready to nudge.
function initialSets(
  ex: ExerciseDef,
  weight: number | undefined,
  lastSets?: SetEntry[],
  leveledUp?: boolean,
): SetEntry[] {
  return Array.from({ length: ex.sets }, (_, i) => {
    if (ex.kind === 'bodyweight' && ex.metric === 'time') {
      return { seconds: defaultSeconds(ex, i, lastSets) };
    }
    if (ex.kind === 'bodyweight') {
      return { reps: defaultReps(ex, i, lastSets, leveledUp) };
    }
    return { reps: defaultReps(ex, i, lastSets, leveledUp), weight: weight ?? ex.startWeight };
  });
}

export default function LogExercise() {
  const { dayId, exerciseId, logId } = useParams();
  const { data, logSession, updateSession, deleteSession } = useStore();
  const nav = useNavigate();

  const isEditing = !!logId;
  const editLog = isEditing ? data.logs.find((l) => l.id === logId) : undefined;

  // In edit mode the exercise comes from the log; otherwise from the route.
  const ex = data.exercises.find((e) => e.id === (isEditing ? editLog?.exerciseId : exerciseId));
  const last = ex ? lastLog(data.logs, ex.id) : undefined;
  const weight = ex ? data.workingWeight[ex.id] : undefined;

  // Edit mode prefills the log's actual sets; log mode prefills from last session.
  const [sets, setSets] = useState<SetEntry[]>(() => {
    if (!ex) return [];
    if (isEditing && editLog) return editLog.sets.map((s) => ({ ...s }));
    return initialSets(ex, weight, last?.sets, last?.completed);
  });

  const completed = useMemo(() => (ex ? isCompleted(ex, sets) : false), [ex, sets]);

  // Where back / save returns to.
  const returnTo = isEditing
    ? `/history/${ex?.id ?? ''}`
    : `/day/${dayId}`;

  if (!ex || (isEditing && !editLog)) return <Header title="Not found" back="/" />;

  const isTime = ex.kind === 'bodyweight' && ex.metric === 'time';
  const isWeighted = ex.kind !== 'bodyweight';

  const update = (i: number, patch: Partial<SetEntry>) =>
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const save = () => {
    if (isEditing && editLog) updateSession(editLog.id, ex, sets);
    else logSession(ex, dayId!, sets);
    nav(returnTo);
  };

  const remove = () => {
    if (editLog && confirm('Delete this logged session?')) {
      deleteSession(editLog.id);
      nav(returnTo);
    }
  };

  return (
    <div className="safe-bottom pb-28">
      <Header
        title={isEditing ? `Edit · ${ex.name}` : ex.name}
        subtitle={
          isEditing && editLog
            ? `Logged ${relativeWhen(editLog.performedOn)}`
            : formatTarget(ex) + (weight != null ? ` @ ${weight} lbs` : '')
        }
        back={returnTo}
      />

      {ex.note && !isEditing && (
        <p className="mb-4 rounded-xl bg-white p-3 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-200">
          {ex.note}
        </p>
      )}

      {last && !isEditing && (
        <p className="mb-4 text-sm text-slate-500">
          Last time <span className="text-slate-400">({relativeWhen(last.performedOn)})</span>:{' '}
          <span className="font-medium text-slate-700">{formatSets(ex, last.sets)}</span>
        </p>
      )}

      <div className="space-y-3">
        {sets.map((s, i) => (
          <div key={i} className="flex items-end gap-3">
            <span className="w-6 pb-2.5 text-sm font-bold text-slate-400">{i + 1}</span>
            {isTime ? (
              <Stepper
                label="Seconds"
                hint={`(${ex.repLow}-${ex.repHigh})`}
                value={s.seconds}
                step={5}
                min={0}
                maxed={(s.seconds ?? 0) >= ex.repHigh}
                low={(s.seconds ?? 0) > 0 && (s.seconds ?? 0) < ex.repLow}
                onChange={(v) => update(i, { seconds: v })}
              />
            ) : (
              <Stepper
                label="Reps"
                hint={ex.repLow === ex.repHigh ? undefined : `(${ex.repLow}-${ex.repHigh})`}
                value={s.reps}
                step={1}
                min={0}
                maxed={(s.reps ?? 0) >= ex.repHigh}
                low={(s.reps ?? 0) > 0 && (s.reps ?? 0) < ex.repLow}
                onChange={(v) => update(i, { reps: v })}
              />
            )}
            {isWeighted && (
              <Stepper
                label="Weight (lbs)"
                value={s.weight}
                step={ex.increment ?? 5}
                min={0}
                onChange={(v) => update(i, { weight: v })}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3 text-sm">
        <button
          onClick={() => setSets((p) => [...p, p.length ? { ...p[p.length - 1] } : {}])}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-600 active:bg-slate-100"
        >
          + Add set
        </button>
        {sets.length > 1 && (
          <button
            onClick={() => setSets((p) => p.slice(0, -1))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-500 active:bg-slate-100"
          >
            − Remove set
          </button>
        )}
        {!isEditing && (
          <Link to={`/history/${ex.id}`} className="ml-auto self-center font-medium text-steel-600 active:underline">
            History
          </Link>
        )}
      </div>

      {completed && ex.increment && !isEditing && (
        <div className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          ✅ Hit every set at {ex.repHigh} reps — next time go {(weight ?? ex.startWeight ?? 0) + ex.increment} lbs (+
          {ex.increment}).
        </div>
      )}

      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-slate-200 bg-[#eef1f6]/95 p-4 backdrop-blur">
        {isEditing ? (
          <div className="flex gap-3">
            <button
              onClick={remove}
              className="rounded-xl border border-rose-300 px-4 py-3.5 text-base font-semibold text-rose-600 active:bg-rose-50"
            >
              Delete
            </button>
            <div className="flex-1">
              <PrimaryButton onClick={save}>Save changes</PrimaryButton>
            </div>
          </div>
        ) : (
          <PrimaryButton onClick={save}>Save workout</PrimaryButton>
        )}
      </div>
    </div>
  );
}
