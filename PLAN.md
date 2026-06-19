# Gromo — Rebuild MVP Plan

A personal workout tracker. Rebuilt from scratch (the 2020 Vue 2 + .NET/GraphQL/Postgres
version is being retired). Goal: log my weekly lifts, see at a glance whether I'm
trending **up**, and get a nudge to add weight when I complete a target.

## Principles

- **Personal use, one user.** No accounts, no API, no server.
- **Offline-first.** Data lives in the browser (`localStorage`). Backup via JSON export/import.
- **Hosted free** on GitHub Pages, installable to the phone home screen (PWA).
- **Don't over-build.** This is the thing the 2020 version never shipped: the
  *am-I-improving* feedback. Everything else is in service of that.

## Stack

- **Vite + React + TypeScript + Tailwind**
- State: React hooks + a `useLocalStorage` wrapper (no Redux/Zustand)
- **PWA** via `vite-plugin-pwa` (Add to Home Screen, works offline)
- Deploy: static build to **GitHub Pages**

## Scope

**In v1:** the four lifting days — Upper Push, Lower Body, Core + Shoulder, Upper Pull.

**Out of v1:**
- **Friday walk** — cardio is a distance/pace/time shape, not sets×reps. Log it in the
  phone's health app for now; revisit in v2 if missed.
- Multi-device sync (would need a server).
- "Pick 2 / rotation" enforcement on Lower Body — all exercises just listed; log what
  you actually did.

## The progression model (the core of the app)

Double progression over a rep **range**:

- Each exercise has a target: `sets` × `repLow`–`repHigh` at a working `weight`.
- You log each set's reps (and weight, for weighted exercises).
- **Trigger:** when *every* set reaches `repHigh` → the exercise is "completed" at this
  weight → app suggests **+increment lbs** next session (pre-filled, overridable).
- Until then you stay at the weight, filling in reps across weeks
  (e.g. `12,10,10,6` → ... → `12,12,12,12` → level up).

### Exercise kinds

1. **`weighted-progress`** — has weight + an increment (5 or 2.5). Full nudge. (Bench, pulldown, curls…)
2. **`weighted-static`** — has weight, `increment = 0`. Log reps/weight, **no nudge.** (Lateral raise, face pull…)
3. **`bodyweight`** — no weight field. Log reps **or** time (seconds). No nudge. (Planks, bird dog, clamshell…)

### The "trending up" indicator

Per exercise, compare this session to the previous logged session:

- **↑ (green)** — earned a level-up (all sets hit `repHigh`), or total reps/volume increased
- **→ (grey)** — about the same
- **↓ (red)** — fewer reps / dropped weight

For `weighted-progress`, volume = Σ(reps × weight). For bodyweight, compare total reps or time.
History view shows working-weight-over-time (the real long arc).

## Data model (localStorage, single JSON blob under key `gromo`)

```ts
type ExerciseKind = 'weighted-progress' | 'weighted-static' | 'bodyweight';
type BodyweightMetric = 'reps' | 'time'; // only for kind === 'bodyweight'

interface ExerciseDef {
  id: string;
  name: string;
  kind: ExerciseKind;
  sets: number;
  repLow: number;
  repHigh: number;
  startWeight?: number;     // weighted kinds
  increment?: number;       // weighted-progress only (5 | 2.5)
  metric?: BodyweightMetric; // bodyweight only
  note?: string;            // the coaching note from the plan
}

interface DayDef {
  id: string;
  name: string;            // "Upper Push"
  subtitle?: string;       // "Chest · Shoulders · Triceps"
  exerciseIds: string[];
}

interface SetEntry {
  reps?: number;           // weighted + bodyweight(reps)
  weight?: number;         // weighted kinds
  seconds?: number;        // bodyweight(time)
}

interface SessionLog {
  id: string;
  exerciseId: string;
  dayId: string;
  performedOn: string;     // ISO date
  sets: SetEntry[];
  completed: boolean;      // all sets hit repHigh (weighted-progress)
}

interface GromoData {
  version: 1;
  days: DayDef[];
  exercises: ExerciseDef[];
  logs: SessionLog[];
  // current working weight per exercise (derived/updated on level-up)
  workingWeight: Record<string, number>;
}
```

## Seed program (ships as default data)

### Upper Push — Chest · Shoulders · Triceps
| Exercise | kind | sets | reps | start | incr |
|---|---|---|---|---|---|
| Barbell Bench Press | weighted-progress | 4 | 8–10 | 95 | 5 |
| Cable Chest Press | weighted-progress | 3 | 10–12 | 30 | 5 |
| Cable Fly | weighted-static | 2 | 12–15 | 20 | – |
| Cable Face Pull (rope) | weighted-static | 3 | 15–20 | 20 | – |
| Dumbbell Lateral Raise | weighted-static | 2 | 15–15 | 10 | – |
| Rope Tricep Pushdown | weighted-progress | 3 | 12–15 | 35 | 5 |
| Rope Tricep Pushdown (burnout) | weighted-static | 2 | 15–20 | 20 | – |

### Lower Body — Knee & back friendly (log what you did)
| Exercise | kind | sets | reps | start | incr |
|---|---|---|---|---|---|
| Hyper Pro Leg Extension | weighted-progress | 4 | 12–15 | 25 | 5 |
| Cable TKE | weighted-static | 3 | 15–20 | 5 | – |
| Hyper Pro Hamstring Curl | weighted-progress | 3 | 10–12 | 20 | 5 |
| Reverse Hyper | bodyweight (reps) | 3 | 12–15 | – | – |
| Clamshell | bodyweight (reps) | 3 | 15–20 | – | – |
| Seated Dumbbell Calf Raise | weighted-progress | 3 | 15–20 | 25 | 5 |
| Hyper Thrust *(rotate)* | bodyweight (reps) | 3 | 12–15 | – | – |
| Hyper Pro Back Extension *(rotate)* | bodyweight (reps) | 3 | 12–15 | – | – |
| Stability Ball Wall Squat *(rotate)* | bodyweight (reps) | 3 | 10–15 | – | – |

### Core + Shoulder Maintenance — no spinal flexion
| Exercise | kind | sets | reps/time | start | incr |
|---|---|---|---|---|---|
| Stability Ball Dead Bug | bodyweight (reps) | 3 | 8–10 ea | – | – |
| Bird Dog | bodyweight (reps) | 3 | 10 ea | – | – |
| Pallof Press (cable) | weighted-static | 3 | 12 ea | 10 | – |
| Stability Ball Plank | bodyweight (time) | 3 | 20–30 sec | – | – |
| Glute Bridge | bodyweight (reps) | 3 | 15 | – | – |
| Dumbbell W-Raise (prone) | weighted-static | 3 | 12–15 | 5 | – |

### Upper Pull — Back · Biceps · Traps
| Exercise | kind | sets | reps | start | incr |
|---|---|---|---|---|---|
| Lat Pulldown | weighted-progress | 4 | 8–12 | 95 | 5 |
| Chest-Supported Dumbbell Row | weighted-progress | 3 | 10–12 | 25 | 5 |
| Dumbbell Shrugs | weighted-progress | 3 | 12–15 | 45 | 5 |
| EZ Bar Curl | weighted-progress | 3 | 10–12 | 50 | 5 |
| Dumbbell Hammer Curl | weighted-progress | 2 | 12–15 | 20 | 5 |
| Resistance Band Curl | bodyweight (reps) | 2 | 15–20 | – | – |
| Cable Face Pull (rope) | weighted-static | 3 | 15–20 | 20 | – |

> Coaching notes from the plan (form cues, "isolation — skip if fatigued", etc.) carried
> into each exercise's `note` and shown on the log screen.

## Screens

1. **Home** — list of the 4 days (name + subtitle). Tap a day.
2. **Day** — that day's exercises as cards. Each shows: target (`4 × 8–10`), current
   working weight, and the ↑/→/↓ vs last session. Tap to log.
3. **Log exercise** — shows target + note + last session's numbers. Enter reps (and weight)
   per set. On save: if all sets hit `repHigh`, show "✅ Completed — add {incr} lbs next time"
   and bump `workingWeight`. Bodyweight exercises log reps or seconds.
4. **History (per exercise)** — recent sessions list + working-weight-over-time
   (simple line/sparkline).
5. **Settings / Data** — Export JSON (download backup), Import JSON (restore).

## Build order

1. Scaffold Vite + React + TS + Tailwind; strip old `api/` and `web/`.
2. Types + seed data + `useLocalStorage` store.
3. Home + Day screens (read-only against seed).
4. Log screen + progression logic (the level-up trigger).
5. ↑/→/↓ indicator + History view.
6. Export/Import.
7. PWA + GitHub Pages deploy.

When v1 is solid: merge to `main`, delete the old `api/`/`web/` so main = the new app.
