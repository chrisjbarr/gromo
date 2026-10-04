import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Header, PrimaryButton } from '../components';
import { newId } from '../id';

const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-steel-200';

export default function DayForm() {
  const { dayId } = useParams();
  const { data, saveDay, deleteDay } = useStore();
  const nav = useNavigate();

  const existing = dayId ? data.days.find((d) => d.id === dayId) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [subtitle, setSubtitle] = useState(existing?.subtitle ?? '');

  if (dayId && !existing) return <Header title="Not found" back="/" />;

  const returnTo = '/?edit=1';
  const exerciseCount = existing?.exerciseIds.length ?? 0;
  const logCount = existing ? data.logs.filter((l) => existing.exerciseIds.includes(l.exerciseId)).length : 0;

  const save = () => {
    const day = {
      id: existing?.id ?? newId(),
      name: name.trim(),
      subtitle: subtitle.trim() || undefined,
      exerciseIds: existing?.exerciseIds ?? [],
    };
    saveDay(day);
    // A brand-new day is empty, so drop straight into adding exercises to it.
    nav(existing ? returnTo : `/day/${day.id}?edit=1`);
  };

  const remove = () => {
    if (!existing) return;
    const parts = [
      exerciseCount ? `${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'}` : '',
      logCount ? `${logCount} logged session${logCount === 1 ? '' : 's'}` : '',
    ].filter(Boolean);
    const extra = parts.length ? ` and its ${parts.join(' and ')}` : '';
    if (confirm(`Delete ${existing.name}${extra}? This can't be undone.`)) {
      deleteDay(existing.id);
      nav(returnTo);
    }
  };

  return (
    <div className="safe-bottom pb-28">
      <Header title={existing ? `Edit · ${existing.name}` : 'Add day'} back={returnTo} showHome={false} />

      <div className="space-y-5">
        <div>
          <div className="mb-1.5 text-xs font-medium text-slate-500">Name</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Full Body"
            autoFocus={!existing}
            className={inputCls}
          />
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-slate-500">Subtitle (optional)</div>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Chest · Back · Legs"
            className={inputCls}
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
            <PrimaryButton onClick={save} disabled={name.trim() === ''}>
              {existing ? 'Save changes' : 'Add day'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
