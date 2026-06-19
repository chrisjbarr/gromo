import { useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Header } from '../components';
import { sessionScore } from '../progression';
import type { ExerciseDef, SessionLog, SetEntry } from '../types';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtSets(ex: ExerciseDef, sets: SetEntry[]): string {
  if (ex.kind === 'bodyweight' && ex.metric === 'time') return sets.map((s) => `${s.seconds ?? 0}s`).join(' · ');
  if (ex.kind === 'bodyweight') return sets.map((s) => `${s.reps ?? 0}`).join(' · ');
  return sets.map((s) => `${s.reps ?? 0}×${s.weight ?? 0}`).join(' · ');
}

// Minimal inline SVG sparkline of the per-session score over time (oldest → newest).
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 320;
  const h = 64;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <polyline points={pts.join(' ')} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function History() {
  const { exerciseId } = useParams();
  const { data } = useStore();
  const ex = data.exercises.find((e) => e.id === exerciseId);

  if (!ex) return <Header title="Not found" back />;

  const logs: SessionLog[] = data.logs
    .filter((l) => l.exerciseId === ex.id)
    .sort((a, b) => a.performedOn.localeCompare(b.performedOn));

  const scores = logs.map((l) => sessionScore(ex, l.sets));
  const metricLabel =
    ex.kind === 'bodyweight' ? (ex.metric === 'time' ? 'total seconds' : 'total reps') : 'volume (reps × lbs)';

  return (
    <div className="safe-bottom">
      <Header title={ex.name} subtitle="History" back />

      {logs.length === 0 && <p className="text-slate-500">No sessions logged yet.</p>}

      {logs.length >= 2 && (
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-2 text-xs font-medium text-slate-500">Trend — {metricLabel}</div>
          <Sparkline values={scores} />
        </div>
      )}

      <div className="space-y-2">
        {[...logs].reverse().map((log) => (
          <div key={log.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
            <div>
              <div className="text-sm font-medium text-slate-700">{fmtDate(log.performedOn)}</div>
              <div className="text-xs text-slate-400">{fmtSets(ex, log.sets)}</div>
            </div>
            {log.completed && <span className="text-sm font-medium text-emerald-600">✅ leveled up</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
