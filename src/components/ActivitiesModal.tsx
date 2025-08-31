'use client';

import React, { useEffect } from 'react';
import { ActivityChip } from './ActivityChip';

export function ActivitiesModal({
  open,
  onClose,
  activities,
  describe,
}: {
  open: boolean;
  onClose: () => void;
  activities: string[];
  describe: (name: string) => string;
}) {
  if (!open) return null;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-600 ring-1 ring-slate-100 dark:ring-slate-500 bg-white dark:bg-slate-800 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-600 bg-white/95 dark:bg-slate-800/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-800/60">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">All Activities</h3>
          <button onClick={onClose} className="rounded-full border border-slate-300 dark:border-slate-500 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Close</button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5 no-scrollbar">
          <ul className="space-y-2 text-sm">
            {activities.map((a) => (
              <li key={`ma-${a}`}>
                <ActivityChip name={a} description={describe(a)} expandable={true} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


