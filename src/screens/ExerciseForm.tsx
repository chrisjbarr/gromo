import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Header, PrimaryButton, Stepper } from '../components';
import { newId } from '../id';
import type { BodyweightMetric, ExerciseDef, ExerciseKind } from '../types';

const KINDS: { kind: ExerciseKind; label: string; hint: string }[] = [
  { kind: 'weighted-progress', label: 'Progressive', hint: 'Nudges you to add weight' },
  { kind: 'weighted-static', label: 'Weighted', hint: 'Tracks weight, no nudge' },
  { kind: 'bodyweight', label: 'Bodyweight', hint: 'Reps or time, no weight' },
];

const INCREMENTS = [2.5, 5, 10];

interface Draft {
  name: string;
  kind: ExerciseKind;
  metric: BodyweightMetric;
  sets: number;
  repLow: number;
  repHigh: number;
  weight: number;
  increment: number;
  note: string;
}

function draftFrom(ex: ExerciseDef | undefined, workingWeight: number | undefined): Draft {
  if (!ex) {
    return { name: '', kind: 'weighted-progress', metric: 'reps', sets: 3, repLow: 8, repHigh: 12, weight: 20, increment: 5, note: '' };
  }
  return {
    name: ex.name,
    kind: ex.kind,
    metric: ex.metric ?? 'reps',
    sets: ex.sets,
    repLow: ex.repLow,
    repHigh: ex.repHigh,
    weight: workingWeight ?? ex.startWeight ?? 20,
    increment: ex.increment || 5,
    note: ex.note ?? '',
  };
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border px-2 py-2 text-sm font-semibold ${
        active ? 'border-steel-600 bg-steel-600 text-white' : 'border-slate-300 bg-white text-slate-600 active:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-xs font-medium text-slate-500">{children}</div>;
}

export default function ExerciseForm() {
  const { dayId, exerciseId } = useParams();
  const { data, saveExercise, deleteExercise } = useStore();
  const nav = useNavigate();

  const day = data.days.find((d) => d.id === dayId);
  const existing = exerciseId ? data.exercises.find((e) => e.id === exerciseId) : undefined;
  const [draft, setDraft] = useState<Draft>(() => draftFrom(existing, existing ? data.workingWeight[existing.id] : undefined));

  const returnTo = `/day/${dayId}?edit=1`;

  if (!day || (exerciseId && !existing)) return <Header title="Not found" back="/" />;

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const isTime = draft.kind === 'bodyweight' && draft.metric === 'time';
  const isWeighted = draft.kind !== 'bodyweight';
  const valid = draft.name.trim() !== '' && draft.sets >= 1 && draft.repLow >= 1 && draft.repLow <= draft.repHigh;
  const logCount = existing ? data.logs.filter((l) => l.exerciseId === existing.id).length : 0;

  const save = () => {
    const ex: ExerciseDef = {
      id: existing?.id ?? newId(),
      name: draft.name.trim(),
      kind: draft.kind,
      sets: draft.sets,
      repLow: draft.repLow,
      repHigh: draft.repHigh,
    };
    if (isWeighted) ex.startWeight = existing?.startWeight ?? draft.weight;
    if (draft.kind === 'weighted-progress') ex.increment = draft.increment;
    if (draft.kind === 'bodyweight') ex.metric = draft.metric;
    if (draft.note.trim()) ex.note = draft.note.trim();

    saveExercise(day.id, ex, isWeighted ? draft.weight : undefined);
    nav(returnTo);
  };

  const remove = () => {
    if (!existing) return;
    const history = logCount ? ` and its ${logCount} logged session${logCount === 1 ? '' : 's'}` : '';
    if (confirm(`Delete ${existing.name}${history}? This can't be undone.`)) {
      deleteExercise(day.id, existing.id);
      nav(returnTo);
    }
  };

  return (
    <div className="safe-bottom pb-28">
      <Header title={existing ? `Edit · ${existing.name}` : 'Add exercise'} subtitle={day.name} back={returnTo} />

      <div className="space-y-5">
        <div>
          <FieldLabel>Name</FieldLabel>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. Incline Dumbbell Press"
            autoFocus={!existing}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-steel-200"
          />
        </div>

        <div>
          <FieldLabel>Type</FieldLabel>
          <div className="flex gap-2">
            {KINDS.map((k) => (
              <Chip key={k.kind} active={draft.kind === k.kind} onClick={() => set({ kind: k.kind })}>
                {k.label}
              </Chip>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">{KINDS.find((k) => k.kind === draft.kind)?.hint}</p>
        </div>

        {draft.kind === 'bodyweight' && (
          <div>
            <FieldLabel>Measure</FieldLabel>
            <div className="flex gap-2">
              <Chip active={draft.metric === 'reps'} onClick={() => set({ metric: 'reps' })}>
                Reps
              </Chip>
              <Chip active={draft.metric === 'time'} onClick={() => set({ metric: 'time' })}>
                Time (sec)
              </Chip>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Stepper label="Sets" value={draft.sets} step={1} min={1} onChange={(v) => set({ sets: v })} />
          {isWeighted && (
            <Stepper
              label={existing ? 'Current weight (lbs)' : 'Weight (lbs)'}
              value={draft.weight}
              step={draft.kind === 'weighted-progress' ? draft.increment : 5}
              min={0}
              onChange={(v) => set({ weight: v })}
            />
          )}
        </div>

        <div className="flex gap-3">
          <Stepper
            label={isTime ? 'Min seconds' : 'Min reps'}
            value={draft.repLow}
            step={isTime ? 5 : 1}
            min={1}
            low={draft.repLow > draft.repHigh}
            onChange={(v) => set({ repLow: v })}
          />
          <Stepper
            label={isTime ? 'Max seconds' : 'Max reps'}
            value={draft.repHigh}
            step={isTime ? 5 : 1}
            min={1}
            low={draft.repLow > draft.repHigh}
            onChange={(v) => set({ repHigh: v })}
          />
        </div>
        {draft.repLow > draft.repHigh && <p className="-mt-3 text-xs text-rose-500">Min can't be more than max.</p>}

        {draft.kind === 'weighted-progress' && (
          <div>
            <FieldLabel>Add per level-up (lbs)</FieldLabel>
            <div className="flex gap-2">
              {INCREMENTS.map((inc) => (
                <Chip key={inc} active={draft.increment === inc} onClick={() => set({ increment: inc })}>
                  +{inc}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div>
          <FieldLabel>Note (optional)</FieldLabel>
          <textarea
            value={draft.note}
            onChange={(e) => set({ note: e.target.value })}
            rows={3}
            placeholder="Form cues, reminders…"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-steel-200"
          />
        </div>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-slate-200 bg-[#eef1f6]/95 p-4 backdrop-blur">
        <div className="flex gap-3">
          {existing && (
            <button
              onClick={remove}
              className="rounded-xl border border-rose-300 px-4 py-3.5 text-base font-semibold text-rose-600 active:bg-rose-50"
            >
              Delete
            </button>
          )}
          <div className="flex-1">
            <PrimaryButton onClick={save} disabled={!valid}>
              {existing ? 'Save changes' : 'Add to day'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
