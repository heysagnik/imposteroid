'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ActivityChip } from './ActivityChip';

export function ActivitiesCard({ activities, onOpenModal }: { activities: string[]; onOpenModal: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollHeight > el.clientHeight + 5);
    check();
    const RO = (window as unknown as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    let ro: ResizeObserver | undefined;
    if (RO) { ro = new RO(check); ro.observe(el); }
    window.addEventListener('resize', check);
    return () => { if (ro && el) ro.unobserve(el); window.removeEventListener('resize', check); };
  }, [activities]);

  // no-op toggle removed; ActivityChip currently handles its own expand behavior

  return (
    <div className="bento-card md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-5 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Activities</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">{activities.length} total</span>
      </div>
      <div ref={ref} className="relative mt-3 overflow-hidden no-scrollbar rounded-lg border border-slate-100 dark:border-slate-600 p-3 flex-1">
        <ul className="space-y-2 text-sm">
          {activities.map((a) => (
            <li key={a}>
              <ActivityChip name={a} description={describe(a)} expandable={true} />
            </li>
          ))}
        </ul>
        {overflow ? (
          <>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/95 via-white/70 to-transparent dark:from-slate-800/95 dark:via-slate-800/70 dark:to-transparent" />
            <div className="absolute bottom-1 left-0 right-0 flex justify-center">
              <button onClick={onOpenModal} className="rounded-full bg-slate-900 dark:bg-slate-100 px-3 py-1.5 text-xs font-medium text-white dark:text-slate-900 shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200">View all activities</button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function describe(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('main')) return 'Main entry activity shown when the app launches.';
  if (n.includes('launcher')) return 'Launcher-targeted activity; appears on the home screen launcher.';
  if (n.includes('qr')) return 'Screen related to QR scanning or generation.';
  if (n.includes('scanner')) return 'Camera-backed screen used to scan codes.';
  if (n.includes('pdf')) return 'Activity used to decode or display PDF documents.';
  if (n.includes('request') || n.includes('permission')) return 'Screen that may request or explain runtime permissions.';
  return 'Declared application screen; launched via intents to present UI.';
}


