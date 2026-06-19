import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Header, PrimaryButton } from '../components';
import { formatTarget, isCompleted, lastLog } from '../progression';
import type { SetEntry, ExerciseDef } from '../types';

// Build the initial set rows: prefill weight from working weight, reps blank.
function initialSets(ex: ExerciseDef, weight: number | undefined, lastSets?: SetEntry[]): SetEntry[] {
  return Array.from({ length: ex.sets }, (_, i) => {
    if (ex.kind === 'bodyweight' && ex.metric === 'time') {
      return { seconds: lastSets?.[i]?.seconds };
    }
    if (ex.kind === 'bodyweight') {
      return { reps: lastSets?.[i]?.reps };
    }
    return { reps: undefined, weight: weight ?? ex.startWeight };
  });
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-lg text-white focus:border-blue-500 focus:outline-none"
      />
    </label>
  );
}

export default function LogExercise() {
  const { dayId, exerciseId } = useParams();
  const { data, logSession } = useStore();
  const nav = useNavigate();

  const ex = data.exercises.find((e) => e.id === exerciseId);
  const last = ex ? lastLog(data.logs, ex.id) : undefined;
  const weight = ex ? data.workingWeight[ex.id] : undefined;

  const [sets, setSets] = useState<SetEntry[]>(() =>
    ex ? initialSets(ex, weight, last?.sets) : [],
  );

  const completed = useMemo(() => (ex ? isCompleted(ex, sets) : false), [ex, sets]);

  if (!ex) return <Header title="Not found" back />;

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
      <Header title={ex.name} subtitle={formatTarget(ex) + (weight != null ? ` @ ${weight} lbs` : '')} back />

      {ex.note && (
        <p className="mb-4 rounded-xl bg-slate-800/60 p-3 text-sm leading-relaxed text-slate-300">{ex.note}</p>
      )}

      {last && (
        <p className="mb-4 text-sm text-slate-400">
          Last time:{' '}
          {isTime
            ? last.sets.map((s) => `${s.seconds ?? 0}s`).join(' · ')
            : ex.kind === 'bodyweight'
              ? last.sets.map((s) => `${s.reps ?? 0}`).join(' · ')
              : last.sets.map((s) => `${s.reps ?? 0}×${s.weight ?? 0}`).join(' · ')}
        </p>
      )}

      <div className="space-y-3">
        {sets.map((s, i) => (
          <div key={i} className="flex items-end gap-3">
            <span className="w-8 pb-2 text-sm font-semibold text-slate-500">{i + 1}</span>
            {isTime ? (
              <NumberField label="Seconds" value={s.seconds} onChange={(v) => update(i, { seconds: v })} />
            ) : (
              <NumberField label="Reps" value={s.reps} onChange={(v) => update(i, { reps: v })} />
            )}
            {isWeighted && (
              <NumberField label="Weight (lbs)" value={s.weight} onChange={(v) => update(i, { weight: v })} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3 text-sm">
        <button
          onClick={() => setSets((p) => [...p, isTime ? { seconds: undefined } : { reps: undefined, weight: isWeighted ? weight ?? ex.startWeight : undefined }])}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 active:bg-slate-800"
        >
          + Add set
        </button>
        {sets.length > 1 && (
          <button
            onClick={() => setSets((p) => p.slice(0, -1))}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-400 active:bg-slate-800"
          >
            − Remove set
          </button>
        )}
        <Link
          to={`/history/${ex.id}`}
          className="ml-auto self-center text-slate-400 underline-offset-2 hover:underline"
        >
          History
        </Link>
      </div>

      {completed && ex.increment && (
        <div className="mt-5 rounded-xl bg-emerald-500/15 p-3 text-sm font-medium text-emerald-300">
          ✅ Hit every set at {ex.repHigh} reps — next time go {(weight ?? ex.startWeight ?? 0) + ex.increment} lbs (+
          {ex.increment}).
        </div>
      )}

      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-slate-800 bg-slate-900/95 p-4 backdrop-blur">
        <PrimaryButton onClick={save}>Save workout</PrimaryButton>
      </div>
    </div>
  );
}
