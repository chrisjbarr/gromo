import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { accentFor } from '../accents';
import { relativeWhen } from '../progression';

export default function Home() {
  const { data, moveDay } = useStore();
  // Edit mode lives in the URL so it survives a round trip to the day form.
  const [params, setParams] = useSearchParams();
  const editing = params.get('edit') === '1';

  // Most recent session date across a day's exercises, for the "last done" cue.
  const lastDoneFor = (exerciseIds: string[]): string | undefined => {
    const dates = data.logs
      .filter((l) => exerciseIds.includes(l.exerciseId))
      .map((l) => l.performedOn)
      .sort();
    return dates.length ? dates[dates.length - 1] : undefined;
  };

  const cardCls =
    'relative block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 active:scale-[0.99]';

  return (
    <div className="safe-bottom">
      <header className="safe-top mb-7 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Gromo</h1>
          <p className="mt-1 text-sm text-slate-500">{editing ? 'Add, rename or reorder days' : "Pick today's workout"}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setParams(editing ? {} : { edit: '1' }, { replace: true })}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold active:scale-95 ${
              editing ? 'bg-steel-600 text-white' : 'text-steel-600'
            }`}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
          {!editing && (
            <Link to="/data" className="rounded-full p-2 text-lg text-slate-400 active:scale-90" aria-label="Data & backup">
              ⚙
            </Link>
          )}
        </div>
      </header>

      <div className="space-y-4">
        {data.days.map((day, i) => {
          const lastDone = lastDoneFor(day.exerciseIds);
          const body = (
            <>
              <span className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${accentFor(i).bar}`} />
              <div className="flex items-center justify-between py-5 pl-6 pr-4">
                <div className="min-w-0">
                  <div className="text-lg font-bold text-slate-900">{day.name}</div>
                  {day.subtitle && <div className="mt-0.5 text-sm text-slate-500">{day.subtitle}</div>}
                  <div className="mt-1 text-xs text-slate-400">
                    {editing
                      ? `${day.exerciseIds.length} exercise${day.exerciseIds.length === 1 ? '' : 's'}`
                      : lastDone
                        ? `Last done ${relativeWhen(lastDone)}`
                        : 'Not done yet'}
                  </div>
                </div>
                {editing ? (
                  <span className="shrink-0 text-sm font-medium text-steel-600">Edit ›</span>
                ) : (
                  <span className="text-xl text-slate-300">›</span>
                )}
              </div>
            </>
          );

          if (!editing) {
            return (
              <Link key={day.id} to={`/day/${day.id}`} className={cardCls}>
                {body}
              </Link>
            );
          }

          return (
            <div key={day.id} className="flex items-stretch gap-2">
              <div className="flex flex-col justify-center gap-1">
                <button
                  onClick={() => moveDay(day.id, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${day.name} up`}
                  className="rounded-lg bg-white px-2.5 py-1 text-slate-500 ring-1 ring-slate-200 active:bg-slate-100 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDay(day.id, 1)}
                  disabled={i === data.days.length - 1}
                  aria-label={`Move ${day.name} down`}
                  className="rounded-lg bg-white px-2.5 py-1 text-slate-500 ring-1 ring-slate-200 active:bg-slate-100 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <Link to={`/day/${day.id}/edit`} className={`min-w-0 flex-1 ${cardCls}`}>
                {body}
              </Link>
            </div>
          );
        })}

        {editing && (
          <Link
            to="/days/new"
            className="block rounded-2xl border-2 border-dashed border-slate-300 py-4 text-center font-semibold text-steel-600 active:bg-white"
          >
            + Add day
          </Link>
        )}
      </div>
    </div>
  );
}
