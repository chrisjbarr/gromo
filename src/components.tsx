import { useNavigate } from 'react-router-dom';
import type { Trend } from './progression';
import type { ReactNode } from 'react';

export function Header({ title, subtitle, back }: { title: string; subtitle?: string; back?: boolean }) {
  const nav = useNavigate();
  return (
    <header className="safe-top sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-3 border-b border-slate-800 bg-slate-900/95 px-4 pb-3 backdrop-blur">
      {back && (
        <button
          onClick={() => nav(-1)}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-slate-400 active:bg-slate-800"
        >
          ←
        </button>
      )}
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="truncate text-sm text-slate-400">{subtitle}</p>}
      </div>
    </header>
  );
}

export function TrendBadge({ trend }: { trend: Trend }) {
  if (trend === 'none') return null;
  const map: Record<Exclude<Trend, 'none'>, { glyph: string; cls: string; label: string }> = {
    up: { glyph: '↑', cls: 'bg-emerald-500/15 text-emerald-400', label: 'Trending up' },
    flat: { glyph: '→', cls: 'bg-slate-600/30 text-slate-400', label: 'About the same' },
    down: { glyph: '↓', cls: 'bg-rose-500/15 text-rose-400', label: 'Down from last time' },
  };
  const { glyph, cls, label } = map[trend];
  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base font-bold ${cls}`}
    >
      {glyph}
    </span>
  );
}

export function Card({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-800 bg-slate-800/50 p-4 ${
        onClick ? 'cursor-pointer active:bg-slate-800' : ''
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
      className="w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white active:bg-blue-700 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
