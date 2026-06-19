import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Header, PrimaryButton } from '../components';
import { formatTarget, isCompleted, lastLog, formatSets } from '../progression';
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

function Stepper({
  label,
  hint,
  value,
  step,
  min,
  maxed,
  low,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number | undefined;
  step: number;
  min: number;
  maxed?: boolean;
  low?: boolean;
  onChange: (v: number) => void;
}) {
  const v = value ?? 0;
  const bump = (delta: number) => onChange(Math.max(min, Math.round((v + delta) * 100) / 100));
  const borderCls = maxed
    ? 'border-emerald-400 ring-1 ring-emerald-300'
    : low
      ? 'border-rose-300 ring-1 ring-rose-200'
      : 'border-slate-300';
  const inputCls = maxed
    ? 'border-emerald-200 text-emerald-600'
    : low
      ? 'border-rose-200 text-rose-500'
      : 'border-slate-200 text-slate-900';
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className="flex items-baseline gap-1 text-xs font-medium text-slate-500">
        {label}
        {hint && <span className="text-slate-400">{hint}</span>}
      </span>
      <div className={`flex items-stretch overflow-hidden rounded-xl border bg-white ${borderCls}`}>
        <button
          type="button"
          onClick={() => bump(-step)}
          aria-label={`Decrease ${label}`}
          className="px-3 text-xl font-bold text-slate-500 active:bg-slate-100"
        >
          −
        </button>
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          className={`w-full min-w-0 border-x py-2.5 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-inset focus:ring-steel-200 ${inputCls}`}
        />
        <button
          type="button"
          onClick={() => bump(step)}
          aria-label={`Increase ${label}`}
          className="px-3 text-xl font-bold text-slate-500 active:bg-slate-100"
        >
          +
        </button>
      </div>
    </div>
  );
}

// "5 days ago", "3 weeks ago", "today" — relative phrasing for the last session.
function relativeWhen(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.round((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 9) return `${weeks} weeks ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

export default function LogExercise() {
  const { dayId, exerciseId } = useParams();
  const { data, logSession } = useStore();
  const nav = useNavigate();

  const ex = data.exercises.find((e) => e.id === exerciseId);
  const last = ex ? lastLog(data.logs, ex.id) : undefined;
  const weight = ex ? data.workingWeight[ex.id] : undefined;

  const [sets, setSets] = useState<SetEntry[]>(() =>
    ex ? initialSets(ex, weight, last?.sets, last?.completed) : [],
  );

  const completed = useMemo(() => (ex ? isCompleted(ex, sets) : false), [ex, sets]);

  if (!ex) return <Header title="Not found" back={`/day/${dayId}`} />;

  const isTime = ex.kind === 'bodyweight' && ex.metric === 'time';
  const isWeighted = ex.kind !== 'bodyweight';

  const update = (i: number, patch: Partial<SetEntry>) =>
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const save = () => {
    logSession(ex, dayId!, sets);
    nav(`/day/${dayId}`);
  };

  return (
    <div className="safe-bottom pb-28">
      <Header title={ex.name} subtitle={formatTarget(ex) + (weight != null ? ` @ ${weight} lbs` : '')} back={`/day/${dayId}`} />

      {ex.note && (
        <p className="mb-4 rounded-xl bg-white p-3 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-200">
          {ex.note}
        </p>
      )}

      {last && (
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
        <Link to={`/history/${ex.id}`} className="ml-auto self-center font-medium text-steel-600 active:underline">
          History
        </Link>
      </div>

      {completed && ex.increment && (
        <div className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          ✅ Hit every set at {ex.repHigh} reps — next time go {(weight ?? ex.startWeight ?? 0) + ex.increment} lbs (+
          {ex.increment}).
        </div>
      )}

      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-slate-200 bg-[#eef1f6]/95 p-4 backdrop-blur">
        <PrimaryButton onClick={save}>Save workout</PrimaryButton>
      </div>
    </div>
  );
}
