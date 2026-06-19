// Per-day accent colors, cycled by the day's order in the program.
// `bar` is a gradient for the left edge; `text`/`bg` tint the in-card stat.
export interface Accent {
  bar: string;
  text: string;
  bg: string;
}

const ACCENTS: Accent[] = [
  { bar: 'from-indigo-500 to-violet-500', text: 'text-indigo-600', bg: 'bg-indigo-50' },
  { bar: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  { bar: 'from-amber-500 to-orange-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  { bar: 'from-sky-500 to-blue-500', text: 'text-sky-600', bg: 'bg-sky-50' },
];

export function accentFor(index: number): Accent {
  return ACCENTS[index % ACCENTS.length];
}
