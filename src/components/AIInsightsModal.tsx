'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
export function AIInsightsModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: {
    summary?: string;
    key_indicators?: string[];
    forensic_notes?: string[];
    confidence?: string;
    final_risk_score?: number;
    recommendation?: string;
    rationale?: string;
  } | null;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    setLoading(true);
    if (!open) return;
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-600 ring-1 ring-slate-100 dark:ring-slate-500 bg-white dark:bg-slate-800 shadow-2xl">
       <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-600 bg-white/95 dark:bg-slate-800/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-6 w-6 items-center justify-center">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Google_Gemini_icon_2025.svg" alt="Gemini" className="relative h-4 w-4 text-slate-800 dark:text-slate-200" width={16} height={16} />
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Summary</h3>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-300 dark:border-slate-500 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Close</button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5 no-scrollbar">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-2 w-40 rounded bg-slate-100 dark:bg-slate-700" />
              <div className="mt-4 space-y-3">
                <div className="h-20 rounded-2xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" />
                <div className="h-24 rounded-2xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" />
                <div className="h-24 rounded-2xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" />
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="pointer-events-none absolute -top-2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 opacity-30" />
              </div>

              {/* Chat-like bubbles */}
              {data?.summary ? (
                <div className="mt-4 flex justify-center">
                  <div className="relative w-full max-w-2xl rounded-2xl border border-slate-100 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 p-4 shadow-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Summary</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{data.summary}</p>
                  </div>
                </div>
              ) : null}

              {Array.isArray(data?.key_indicators) && data!.key_indicators.length ? (
                <div className="mt-3 flex justify-center">
                  <div className="relative w-full max-w-2xl rounded-2xl border border-slate-100 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 p-4 shadow-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Key Indicators</div>
                    <ul className="mt-1 list-disc pl-5 text-sm text-slate-800 dark:text-slate-200 space-y-1">
                      {data!.key_indicators.map((item, idx) => (
                        <li key={`ki-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {Array.isArray(data?.forensic_notes) && data!.forensic_notes.length ? (
                <div className="mt-3 flex justify-center">
                  <div className="relative w-full max-w-2xl rounded-2xl border border-slate-100 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 p-4 shadow-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Forensic Notes</div>
                    <ul className="mt-1 list-disc pl-5 text-sm text-slate-800 dark:text-slate-200 space-y-1">
                      {data!.forensic_notes.map((item, idx) => (
                        <li key={`fn-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {data?.rationale ? (
                <div className="mt-3 flex justify-center">
                  <div className="relative w-full max-w-2xl rounded-2xl border border-slate-100 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 p-4 shadow-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Rationale</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{data.rationale}</p>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


