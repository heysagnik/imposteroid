'use client';

import React from 'react';
import { Chip } from './ui';

export function IntentsCard({ intents }: { intents: string[] }) {
  return (
    <div className="bento-card md:col-span-2 lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-5 shadow-sm md:row-span-1 lg:row-span-1">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Suspicious Intents</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">{intents?.length || 0} total</span>
      </div>
      <div className="mt-3 rounded-lg border border-slate-100 dark:border-slate-600 p-3">
        {intents && intents.length ? (
          <div className="flex flex-wrap gap-1.5">
            {intents.map((i) => (
              <Chip key={i} className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">{i}</Chip>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400">No suspicious intents found.</div>
        )}
      </div>
    </div>
  );
}


