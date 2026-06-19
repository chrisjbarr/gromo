import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { accentFor } from '../accents';

export default function Home() {
  const { data } = useStore();

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
        {data.days.map((day, i) => (
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
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-sm font-medium">{day.exerciseIds.length}</span>
                <span className="text-xl">›</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
