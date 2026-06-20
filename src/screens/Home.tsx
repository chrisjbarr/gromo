import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { accentFor } from '../accents';
import { relativeWhen } from '../progression';

export default function Home() {
  const { data } = useStore();

  // Most recent session date across a day's exercises, for the "last done" cue.
  const lastDoneFor = (exerciseIds: string[]): string | undefined => {
    const dates = data.logs
      .filter((l) => exerciseIds.includes(l.exerciseId))
      .map((l) => l.performedOn)
      .sort();
    return dates.length ? dates[dates.length - 1] : undefined;
  };

  return (
    <div className="safe-bottom">
      <header className="safe-top mb-7 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Gromo</h1>
          <p className="mt-1 text-sm text-slate-500">Pick today's workout</p>
        </div>
        <Link to="/data" className="rounded-full p-2 text-lg text-slate-400 active:scale-90" aria-label="Data & backup">
          ⚙
        </Link>
      </header>

      <div className="space-y-4">
        {data.days.map((day, i) => {
          const lastDone = lastDoneFor(day.exerciseIds);
          return (
            <Link
              key={day.id}
              to={`/day/${day.id}`}
              className="relative block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
            >
              <span className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${accentFor(i).bar}`} />
              <div className="flex items-center justify-between py-5 pl-6 pr-4">
                <div>
                  <div className="text-lg font-bold text-slate-900">{day.name}</div>
                  {day.subtitle && <div className="mt-0.5 text-sm text-slate-500">{day.subtitle}</div>}
                  <div className="mt-1 text-xs text-slate-400">
                    {lastDone ? `Last done ${relativeWhen(lastDone)}` : 'Not done yet'}
                  </div>
                </div>
                <span className="text-xl text-slate-300">›</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
