'use client';

import React from 'react';
import { Chip } from './ui';

export function AttackVectorsCard({ attackVectors }: { attackVectors: Array<{ value?: string; severity?: string; description?: string }> }) {
  return (
    <div className="bento-card md:col-span-2 lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-5 shadow-sm md:row-span-1 lg:row-span-1">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Attack Vectors</h2>
      </div>
      <div className="mt-3 space-y-2">
        {attackVectors && attackVectors.length ? attackVectors.map((v, idx) => (
          <div key={idx} className="rounded-lg border border-slate-100 dark:border-slate-600 p-3">
            <div className="flex items-center gap-2">
              <Chip tone={severityTone(v?.severity)}>{(v?.severity || 'info').toLowerCase()}</Chip>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{v?.value}</span>
            </div>
            {v?.description ? (
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{v.description}</p>
            ) : null}
          </div>
        )) : (
          <div className="text-xs text-slate-500 dark:text-slate-400">No attack vectors detected.</div>
        )}
      </div>
    </div>
  );
}

function severityTone(level?: string): 'neutral' | 'success' | 'warning' | 'danger' {
  const v = (level || '').toLowerCase();
  if (v === 'high' || v === 'critical') return 'danger';
  if (v === 'medium') return 'warning';
  if (v === 'low') return 'success';
  return 'neutral';
}


