'use client';

import React from 'react';

export function Chip({ children, tone = 'neutral', className = '' }: { children: React.ReactNode; tone?: 'neutral' | 'danger' | 'success' | 'warning'; className?: string }) {
  const toneClasses =
    tone === 'danger'
      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      : tone === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
      : tone === 'warning'
      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
      : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600';
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${toneClasses} ${className}`}>{children}</span>;
}

export function Field({ label, value, mono, truncate }: { label: string; value?: string | null; mono?: boolean; truncate?: boolean }) {
  return (
    <div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-1 text-slate-900 dark:text-slate-100 ${mono ? 'font-mono text-xs' : 'text-sm'} ${truncate ? 'truncate' : ''}`}>{value || '-'}</div>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 dark:border-slate-600 p-3 bg-white dark:bg-slate-800">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

export function ProgressBar({ percent, tone = 'neutral' }: { percent: number; tone?: 'neutral' | 'success' }) {
  const bar = tone === 'success' ? 'bg-emerald-500' : 'bg-blue-500';
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
      <div className={`h-2 rounded-full ${bar}`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
    </div>
  );
}

export function RiskSphere({ percent, tone = 'success' }: { percent: number; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }) {
  const size = 140;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * (1 - Math.max(0, Math.min(100, percent)) / 100);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0" width={size} height={size}>
        <defs>
          <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            {tone === 'danger' ? (
              <>
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#ef4444" />
              </>
            ) : tone === 'warning' ? (
              <>
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f97316" />
              </>
            ) : tone === 'info' ? (
              <>
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="none" className="dark:stroke-slate-600" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#riskGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 800ms ease' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full">
          <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${tone === 'danger' ? 'bg-rose-400/30' : tone === 'warning' ? 'bg-amber-400/30' : tone === 'info' ? 'bg-cyan-400/30' : 'bg-emerald-400/30'}`} />
          <div className="relative text-center">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{percent}</div>
            <div className="-mt-1 text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Safe</div>
          </div>
        </div>
      </div>
    </div>
  );
}


