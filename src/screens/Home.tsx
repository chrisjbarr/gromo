import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { Card } from '../components';

export default function Home() {
  const { data } = useStore();
  return (
    <div className="safe-bottom">
      <header className="safe-top mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Gromo</h1>
          <p className="text-sm text-slate-400">Pick today's workout</p>
        </div>
        <Link to="/data" className="rounded-full p-2 text-slate-400 active:bg-slate-800" aria-label="Data & backup">
          ⚙
        </Link>
      </header>

      <div className="space-y-3">
        {data.days.map((day) => (
          <Link key={day.id} to={`/day/${day.id}`}>
            <Card onClick={() => {}}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">{day.name}</div>
                  {day.subtitle && <div className="text-sm text-slate-400">{day.subtitle}</div>}
                </div>
                <span className="text-slate-500">{day.exerciseIds.length} exercises ›</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
