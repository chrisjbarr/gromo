import { useRef, useState } from 'react';
import { useStore } from '../store';
import { Header, PrimaryButton } from '../components';
import { demoData } from '../demo';
import type { GromoData } from '../types';

export default function Data() {
  const { data, replaceData, resetToSeed } = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `gromo-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as GromoData;
      if (parsed?.version !== 1 || !Array.isArray(parsed.exercises) || !Array.isArray(parsed.logs)) {
        setMsg('That file doesn\'t look like a Gromo backup.');
        return;
      }
      replaceData(parsed);
      setMsg(`Imported ${parsed.logs.length} logged sessions.`);
    } catch {
      setMsg('Could not read that file.');
    }
  };

  const sessionCount = data.logs.length;

  return (
    <div className="safe-bottom">
      <Header title="Data & Backup" back="/" showHome={false} />

      <p className="mb-6 text-sm leading-relaxed text-slate-500">
        Your workouts are saved on this device. Export a backup file to keep them safe or move them to another phone.
        Currently tracking <span className="font-semibold text-slate-800">{sessionCount}</span> logged{' '}
        {sessionCount === 1 ? 'session' : 'sessions'}.
      </p>

      <div className="space-y-3">
        <PrimaryButton onClick={exportJson}>Export backup (.json)</PrimaryButton>

        <button
          onClick={() => fileInput.current?.click()}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 text-base font-semibold text-slate-700 active:bg-slate-100"
        >
          Import backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJson(f);
            e.target.value = '';
          }}
        />

        <button
          onClick={() => {
            replaceData(demoData());
            setMsg('Loaded ~6 weeks of demo history. Reset below to clear it.');
          }}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 text-sm font-medium text-slate-600 active:bg-slate-100"
        >
          Load demo history
        </button>

        <button
          onClick={() => {
            if (confirm('Reset all data back to the starting program? This erases your logged sessions.')) {
              resetToSeed();
              setMsg('Reset to the starting program.');
            }
          }}
          className="w-full rounded-xl py-3 text-sm font-medium text-rose-500 active:bg-rose-50"
        >
          Reset to starting program
        </button>
      </div>

      {msg && <p className="mt-4 rounded-lg bg-white p-3 text-sm text-slate-600 ring-1 ring-slate-200">{msg}</p>}
    </div>
  );
}
