import { Link } from 'react-router-dom';
import type { Trend } from './progression';
import type { ReactNode } from 'react';

// `back` is the explicit parent route (up the hierarchy), not browser history —
// so navigation is predictable regardless of how you got here. A Home button is
// always shown (except on Home itself, via showHome={false}).
export function Header({
  title,
  subtitle,
  back,
  showHome = true,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  showHome?: boolean;
}) {
  return (
    <header className="safe-top sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-3 border-b border-slate-200 bg-[#eef1f6]/95 px-4 pb-3 backdrop-blur">
      {back && (
        <Link
          to={back}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-2xl text-slate-500 active:scale-90"
        >
          ←
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
      </div>
      {showHome && (
        <Link
          to="/"
          aria-label="Home"
          className="shrink-0 rounded-full p-2 text-xl text-slate-500 active:scale-90"
        >
          ⌂
        </Link>
      )}
    </header>
  );
}

export function TrendBadge({ trend }: { trend: Trend }) {
  if (trend === 'none') return null;
  const map: Record<Exclude<Trend, 'none'>, { glyph: string; cls: string; label: string }> = {
    up: { glyph: '↑', cls: 'bg-emerald-100 text-emerald-700', label: 'Trending up' },
    flat: { glyph: '→', cls: 'bg-slate-200 text-slate-500', label: 'About the same' },
    down: { glyph: '↓', cls: 'bg-rose-100 text-rose-600', label: 'Down from last time' },
  };
  const { glyph, cls, label } = map[trend];
  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold ${cls}`}
    >
      {glyph}
    </span>
  );
}

export function Card({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      }`}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-steel-600 py-3.5 text-base font-semibold text-white shadow-sm active:bg-steel-700 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
