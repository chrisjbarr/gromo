import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Header, Card, TrendBadge } from '../components';
import { formatTarget, trendFor, lastLog } from '../progression';
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
  const day = data.days.find((d) => d.id === dayId);

  if (!day) return <Header title="Not found" back />;

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
            <Link key={ex.id} to={`/day/${day.id}/log/${ex.id}`}>
              <Card onClick={() => {}}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-white">{ex.name}</div>
                    <div className="mt-0.5 text-sm text-slate-400">
                      {formatTarget(ex)}
                      {weight != null && <span className="text-slate-300"> @ {weight} lbs</span>}
                    </div>
                    {last && (
                      <div className="mt-1 truncate text-xs text-slate-500">last: {summarizeLast(ex, last.sets)}</div>
                    )}
                  </div>
                  <TrendBadge trend={trend} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
