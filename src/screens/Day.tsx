import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { Header, TrendBadge } from '../components';
import { formatTarget, trendFor, lastLog, formatSets } from '../progression';
import { accentFor } from '../accents';

export default function Day() {
  const { dayId } = useParams();
  const { data, moveExercise } = useStore();
  // Edit mode lives in the URL so it survives a round trip to the exercise form.
  const [params, setParams] = useSearchParams();
  const editing = params.get('edit') === '1';
  const dayIndex = data.days.findIndex((d) => d.id === dayId);
  const day = data.days[dayIndex];

  if (!day) return <Header title="Not found" back="/" />;

  const accent = accentFor(dayIndex);
  const exercises = day.exerciseIds.flatMap((id) => data.exercises.find((e) => e.id === id) ?? []);

  const toggle = (
    <button
      onClick={() => setParams(editing ? {} : { edit: '1' }, { replace: true })}
      className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold active:scale-95 ${
        editing ? 'bg-steel-600 text-white' : 'text-steel-600'
      }`}
    >
      {editing ? 'Done' : 'Edit'}
    </button>
  );

  return (
    <div className="safe-bottom">
      <Header title={day.name} subtitle={day.subtitle} back="/" showHome={false} action={toggle} />
      <div className="space-y-3">
        {exercises.length === 0 && !editing && (
          <p className="text-slate-500">No exercises yet. Tap Edit to add some.</p>
        )}
        {exercises.map((ex, i) => {
          const trend = trendFor(ex, data.logs);
          const last = lastLog(data.logs, ex.id);
          const weight = data.workingWeight[ex.id];

          const body = (
            <>
              <span className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${accent.bar}`} />
              <div className="flex items-center justify-between gap-3 py-4 pl-5 pr-4">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">{ex.name}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${accent.bg} ${accent.text}`}>
                      {formatTarget(ex)}
                    </span>
                    {last && !editing && (
                      <span className="truncate text-xs text-slate-400">last: {formatSets(ex, last.sets)}</span>
                    )}
                  </div>
                </div>

                {editing ? (
                  <span className="shrink-0 text-sm font-medium text-steel-600">Edit ›</span>
                ) : (
                  <div className="flex shrink-0 items-center gap-2">
                    <TrendBadge trend={trend} />
                    {weight != null ? (
                      <div className="text-right">
                        <div className="text-lg font-black leading-none text-slate-900">{weight}</div>
                        <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">lbs</div>
                      </div>
                    ) : (
                      <span className="text-xl text-slate-300">›</span>
                    )}
                  </div>
                )}
              </div>
            </>
          );

          const cardCls =
            'relative block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 active:scale-[0.99]';

          if (!editing) {
            return (
              <Link key={ex.id} to={`/day/${day.id}/log/${ex.id}`} className={cardCls}>
                {body}
              </Link>
            );
          }

          return (
            <div key={ex.id} className="flex items-stretch gap-2">
              <div className="flex flex-col justify-center gap-1">
                <button
                  onClick={() => moveExercise(day.id, ex.id, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${ex.name} up`}
                  className="rounded-lg bg-white px-2.5 py-1 text-slate-500 ring-1 ring-slate-200 active:bg-slate-100 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveExercise(day.id, ex.id, 1)}
                  disabled={i === exercises.length - 1}
                  aria-label={`Move ${ex.name} down`}
                  className="rounded-lg bg-white px-2.5 py-1 text-slate-500 ring-1 ring-slate-200 active:bg-slate-100 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <Link to={`/day/${day.id}/exercise/${ex.id}`} className={`min-w-0 flex-1 ${cardCls}`}>
                {body}
              </Link>
            </div>
          );
        })}

        {editing && (
          <Link
            to={`/day/${day.id}/exercise/new`}
            className="block rounded-2xl border-2 border-dashed border-slate-300 py-4 text-center font-semibold text-steel-600 active:bg-white"
          >
            + Add exercise
          </Link>
        )}
      </div>
    </div>
  );
}
