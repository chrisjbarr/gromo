import { useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Header } from '../components';
import { sessionScore, formatSets } from '../progression';
import type { ExerciseDef, SessionLog } from '../types';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Render reps with a per-set color cue: red below the floor, green at the ceiling.
function ColoredReps({ log, ex }: { log: SessionLog; ex: ExerciseDef }) {
  return (
    <span className="text-base text-slate-800">
      {log.sets.map((s, i) => {
        const r = s.reps ?? 0;
        const cls = r >= ex.repHigh ? 'text-emerald-600' : r > 0 && r < ex.repLow ? 'text-rose-500' : 'text-slate-800';
        return (
          <span key={i}>
            {i > 0 && <span className="text-slate-300">, </span>}
            <span className={cls}>{r}</span>
          </span>
        );
      })}
    </span>
  );
}

// Line chart of a value per session (oldest → newest) with a dot per point and
// start/end value labels, so the trend reads as real numbers, not just a shape.
function Chart({ values, unit }: { values: number[]; unit: string }) {
  if (values.length < 2) return null;
  const w = 320;
  const h = 90;
  const padX = 10;
  const padY = 18;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const xy = (v: number, i: number) => {
    const x = padX + (i / (values.length - 1)) * (w - padX * 2);
    const y = h - padY - ((v - min) / span) * (h - padY * 2);
    return { x, y };
  };
  const pts = values.map((v, i) => xy(v, i));
  const first = pts[0];
  const lastPt = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <polyline
        points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        fill="none"
        stroke="#3f5a86"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#3f5a86" />
      ))}
      <text x={first.x} y={first.y - 7} fontSize="11" fill="#64748b" textAnchor="start">
        {values[0]}
      </text>
      <text x={lastPt.x} y={lastPt.y - 7} fontSize="12" fontWeight="700" fill="#0f172a" textAnchor="end">
        {values[values.length - 1]} {unit}
      </text>
    </svg>
  );
}

interface WeightGroup {
  weight: number;
  rows: SessionLog[]; // newest first
}

// Collapse consecutive same-weight sessions (newest first) into weight groups.
function groupByWeight(logsNewestFirst: SessionLog[]): WeightGroup[] {
  const groups: WeightGroup[] = [];
  for (const log of logsNewestFirst) {
    const w = Math.max(0, ...log.sets.map((s) => s.weight ?? 0));
    const last = groups[groups.length - 1];
    if (last && last.weight === w) last.rows.push(log);
    else groups.push({ weight: w, rows: [log] });
  }
  return groups;
}

// Grouped-by-weight history for weighted exercises.
function GroupedHistory({ ex, logsNewestFirst }: { ex: ExerciseDef; logsNewestFirst: SessionLog[] }) {
  const groups = groupByWeight(logsNewestFirst);
  const target = ex.repLow === ex.repHigh ? `${ex.repLow}` : `${ex.repLow}-${ex.repHigh}`;

  return (
    <div className="space-y-4">
      {groups.map((g, gi) => {
        const isCurrent = gi === 0;
        const nextWeight = gi > 0 ? groups[gi - 1].weight : g.weight + (ex.increment ?? 0);
        const dates = g.rows.map((r) => fmtDate(r.performedOn));
        const span = g.rows.length === 1 ? dates[0] : `${dates[dates.length - 1]} – ${dates[0]}`;

        return (
          <div
            key={`${g.weight}-${g.rows[0].id}`}
            className={`overflow-hidden rounded-2xl bg-white ring-1 ${isCurrent ? 'ring-steel-300' : 'ring-slate-200'}`}
          >
            <div className={`flex items-baseline justify-between px-4 py-2.5 ${isCurrent ? 'bg-steel-50' : 'bg-slate-50'}`}>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-lg font-black ${isCurrent ? 'text-steel-700' : 'text-slate-900'}`}>{g.weight}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">lbs</span>
                <span className="ml-1 text-xs text-slate-400">· target {target}</span>
                {isCurrent && (
                  <span className="ml-1 rounded-full bg-steel-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Current
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {span} · {g.rows.length} {g.rows.length === 1 ? 'session' : 'sessions'}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {g.rows.map((log) => (
                <div key={log.id} className="flex items-center px-4 py-2.5">
                  <span className="w-14 shrink-0 text-xs tabular-nums text-slate-400">{fmtDate(log.performedOn)}</span>
                  <span className="flex-1">
                    <ColoredReps log={log} ex={ex} />
                  </span>
                  <span className="flex shrink-0 items-center justify-end" style={{ minWidth: '3.5rem' }}>
                    {log.completed && ex.increment ? (
                      <span className="rounded-full bg-steel-600 px-2 py-0.5 text-xs font-bold text-white">
                        → {nextWeight}
                      </span>
                    ) : (
                      <span className="text-slate-300">–</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simple flat list for bodyweight exercises (no weight to group by).
function FlatHistory({ ex, logsNewestFirst }: { ex: ExerciseDef; logsNewestFirst: SessionLog[] }) {
  return (
    <div className="space-y-2">
      {logsNewestFirst.map((log) => (
        <div key={log.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{fmtDate(log.performedOn)}</div>
            <div className="mt-0.5">
              {ex.metric === 'time' ? (
                <span className="text-base text-slate-800">{formatSets(ex, log.sets)}</span>
              ) : (
                <ColoredReps log={log} ex={ex} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function History() {
  const { exerciseId } = useParams();
  const { data } = useStore();
  const ex = data.exercises.find((e) => e.id === exerciseId);

  if (!ex) return <Header title="Not found" back="/" />;

  // Back goes to the day this exercise belongs to.
  const day = data.days.find((d) => d.exerciseIds.includes(ex.id));
  const backTo = day ? `/day/${day.id}` : '/';

  const logs: SessionLog[] = data.logs
    .filter((l) => l.exerciseId === ex.id)
    .sort((a, b) => a.performedOn.localeCompare(b.performedOn));
  const newestFirst = [...logs].reverse();

  const isWeighted = ex.kind !== 'bodyweight';
  const values = logs.map((l) =>
    isWeighted ? Math.max(0, ...l.sets.map((s) => s.weight ?? 0)) : sessionScore(ex, l.sets),
  );
  const unit = isWeighted ? 'lbs' : ex.metric === 'time' ? 'sec' : 'reps';
  const metricLabel = isWeighted ? 'working weight' : ex.metric === 'time' ? 'total seconds' : 'total reps';

  return (
    <div className="safe-bottom">
      <Header title={ex.name} subtitle="History" back={backTo} />

      {logs.length === 0 && <p className="text-slate-500">No sessions logged yet.</p>}

      {logs.length >= 2 && (
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 text-xs font-medium text-slate-500">Trend — {metricLabel}</div>
          <Chart values={values} unit={unit} />
        </div>
      )}

      {logs.length > 0 &&
        (isWeighted ? (
          <GroupedHistory ex={ex} logsNewestFirst={newestFirst} />
        ) : (
          <FlatHistory ex={ex} logsNewestFirst={newestFirst} />
        ))}
    </div>
  );
}
