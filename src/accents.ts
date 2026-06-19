// Per-day accent colors, cycled by the day's order in the program.
// `bar` is a gradient for the left edge; `text`/`bg` tint the in-card stat.
export interface Accent {
  bar: string;
  text: string;
  bg: string;
}

const ACCENTS: Accent[] = [
  { bar: 'from-steel-400 to-steel-700', text: 'text-steel-600', bg: 'bg-steel-50' },
  { bar: 'from-teal-500 to-emerald-600', text: 'text-teal-700', bg: 'bg-teal-50' },
  { bar: 'from-amber-500 to-orange-600', text: 'text-amber-700', bg: 'bg-amber-50' },
  { bar: 'from-rose-400 to-rose-600', text: 'text-rose-600', bg: 'bg-rose-50' },
];

export function accentFor(index: number): Accent {
  return ACCENTS[index % ACCENTS.length];
}
