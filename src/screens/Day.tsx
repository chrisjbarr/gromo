import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Header, TrendBadge } from '../components';
import { formatTarget, trendFor, lastLog } from '../progression';
import { accentFor } from '../accents';
import type { SetEntry, ExerciseDef } from '../types';

function summarizeLast(ex: ExerciseDef, sets: SetEntry[]): string {
  if (ex.kind === 'bodyweight' && ex.metric === 'time') {
    return sets.map((s) => `${s.seconds ?? 0}s`).join(' · ');
  }
  if (ex.kind === 'bodyweight') {
    return sets.map((s) => `${s.reps ?? 0}`).join(' · ');
  }
  return sets.map((s) => `${s.reps ?? 0}×${s.weight ?? 0}`).join(' · ');
}

export default function Day() {
  const { dayId } = useParams();
  const { data } = useStore();
  const dayIndex = data.days.findIndex((d) => d.id === dayId);
  const day = data.days[dayIndex];

  if (!day) return <Header title="Not found" back />;

  const accent = accentFor(dayIndex);

  return (
    <div className="safe-bottom">
      <Header title={day.name} subtitle={day.subtitle} back />
      <div className="space-y-3">
        {day.exerciseIds.map((exId) => {
          const ex = data.exercises.find((e) => e.id === exId);
          if (!ex) return null;
          const trend = trendFor(ex, data.logs);
          const last = lastLog(data.logs, ex.id);
          const weight = data.workingWeight[ex.id];

          return (
            <Link
              key={ex.id}
              to={`/day/${day.id}/log/${ex.id}`}
              className="relative block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
            >
              <span className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${accent.bar}`} />
              <div className="flex items-center justify-between gap-3 py-4 pl-5 pr-4">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">{ex.name}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${accent.bg} ${accent.text}`}>
                      {formatTarget(ex)}
                    </span>
                    {last && <span className="truncate text-xs text-slate-400">last: {summarizeLast(ex, last.sets)}</span>}
                  </div>
                </div>

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
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
