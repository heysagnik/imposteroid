'use client';

import React from 'react';
import { Chip } from './ui';

export function BehavioralConsensusCard({
  attackVectors,
  intents,
  flaggedPermissions,
}: {
  attackVectors: Array<{ value?: string; severity?: string; description?: string }>;
  intents: string[];
  flaggedPermissions: Array<{ name: string; severity?: string }>;
}) {
  return (
    <div className="bento-card md:col-span-4 lg:col-span-6 lg:row-span-2 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Behavioral & Findings</h2>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-400">Attack Vectors</div>
          <div className="mt-3 space-y-2">
            {attackVectors.length ? attackVectors.map((v, idx) => (
              <div key={idx} className="rounded-lg border border-slate-100 dark:border-slate-600 p-3 bg-white dark:bg-slate-700">
                <div className="flex items-center gap-2">
                  <Chip tone={severityTone(v?.severity)}>{(v?.severity || 'info').toLowerCase()}</Chip>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{v?.value}</span>
                </div>
                {v?.description ? (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{v.description}</p>
                ) : null}
              </div>
            )) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">No attack vectors detected.</div>
            )}
          </div>
        </section>

        <section>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-400">Suspicious Intents</div>
          <div className="mt-3 rounded-lg border border-slate-100 dark:border-slate-600 p-3 bg-white dark:bg-slate-700">
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

        </section>
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
