'use client';

import React, { useEffect, useState } from 'react';
import { Chip } from './ui';

interface AttackVector {
  value?: string;
  severity?: string;
  description?: string;
}

const STORAGE_KEY = 'attackVectors';

export function AttackVectorsCard({ attackVectors }: { attackVectors: AttackVector[] | undefined }) {
  const [items, setItems] = useState<AttackVector[]>(() => {
    if (attackVectors) return attackVectors;
    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (attackVectors) {
      setItems(attackVectors);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(attackVectors)); } catch {}
    } else if (attackVectors === undefined) {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) setItems(JSON.parse(cached));
      } catch {}
    }
  }, [attackVectors]);

  const count = items.length;
  const previewItems = count > 2 ? items.slice(0, 2) : items;

  return (
    <>
      <div className="bento-card md:col-span-2 lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-5 shadow-sm overflow-hidden min-h-[200px] flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Attack Vectors</h2>
          <div className="flex items-center gap-3" title={`${count} attack vector${count !== 1 ? 's' : ''}`} aria-live="polite">
            <span className="text-xs text-slate-500 dark:text-slate-400">{count} total</span>
          </div>
        </div>

        {/* Constrain the content area so it stays inside the card */}
        <div className="relative mt-4 h-[220px] overflow-hidden">
          {count === 0 && (
            <div className="flex items-center justify-center h-full text-xs text-slate-500 dark:text-slate-400">
              No attack vectors detected.
            </div>
          )}

            {count > 0 && (
              <ul className="space-y-3 overflow-auto p-1 max-h-full no-scrollbar">
                {previewItems.map((v, idx) => {
                  const key = `${v.value || v.description || 'item'}-${v.severity || ''}-${idx}`;
                  return (
                    <li
                      key={key}
                      className="rounded-lg border border-slate-200/70 dark:border-slate-600/60 p-3 bg-white/70 dark:bg-slate-700/60 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Chip tone={severityTone(v.severity)}>
                          {(v?.severity || 'info').toLowerCase()}
                        </Chip>
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {v?.value || '—'}
                        </span>
                      </div>
                      {v?.description && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          {v.description}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

          {count > 2 && (
            <>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/95 via-white/70 to-transparent dark:from-slate-800/95 dark:via-slate-800/70 dark:to-transparent" />
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="rounded-full bg-slate-900 dark:bg-slate-100 px-3 py-1.5 text-xs font-medium text-white dark:text-slate-900 shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200"
                  aria-label={`View all ${count} attack vectors`}
                >
                  View all attack vectors
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <AttackVectorsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          items={items}
        />
      )}
    </>
  );
}

function AttackVectorsModal({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: AttackVector[];
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-600 ring-1 ring-slate-100 dark:ring-slate-500 bg-white dark:bg-slate-800 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-600 bg-white/95 dark:bg-slate-800/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-800/60">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Attack Vectors</h3>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-300 dark:border-slate-500 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5 no-scrollbar">
          <ul className="space-y-3">
            {items.map((v, idx) => (
              <li
                key={`${v.value || v.description || idx}-${idx}`}
                className="rounded-lg border border-slate-100 dark:border-slate-700 p-3 bg-white/60 dark:bg-slate-700/60"
              >
                <div className="flex items-center gap-2">
                  <Chip tone={severityTone(v.severity)}>
                    {(v?.severity || 'info').toLowerCase()}
                  </Chip>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {v?.value || '—'}
                  </span>
                </div>
                {v?.description && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{v.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
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
