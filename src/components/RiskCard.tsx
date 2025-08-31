'use client';

import React from 'react';
import { RiskSphere } from './ui';

export function RiskCard({
  safetyPercent,
  safetyTone,
  verdict,
  riskLabel,
}: {
  safetyPercent: number | null;
  safetyTone: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  verdict: string;
  riskLabel: string;
}) {
  return (
    <div className="bento-card md:col-span-2 lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-5 pl-8 shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Safety Score</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">Higher is safer</span>
      </div>
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-shrink-0 flex items-center justify-center">
          <RiskSphere percent={safetyPercent ?? 0} tone={safetyTone} />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <LabeledStat label="Verdict" value={verdict || '-'} />
          <LabeledStat label="Risk" value={riskLabel} />
        </div>
      </div>
    </div>
  );
}

function LabeledStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-semibold text-slate-900 dark:text-slate-100">
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    </div>
  );
}
