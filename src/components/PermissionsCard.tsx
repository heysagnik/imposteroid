'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PermissionChip } from './PermissionChip';


export function PermissionsCard({ grouped, total, onOpenModal }: { grouped: { suspicious: string[]; legit: string[]; others: string[] }; total: number; onOpenModal: () => void }) {
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
  }, [grouped]);

  return (
    <div className="bento-card md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-5 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Permissions</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">{total} total</span>
      </div>
      <div ref={ref} className="relative mt-4 space-y-3 overflow-hidden no-scrollbar flex-1">
        {grouped.suspicious.length ? (
          <div>
            <div className="mb-2 text-xs font-medium text-red-700 dark:text-red-400">Suspicious ({grouped.suspicious.length})</div>
            <ul className="space-y-2">
              {grouped.suspicious.map((p) => (
                <li key={`s-${p}`}>
                  <PermissionChip name={p} tone="danger" description={describePermission(p)} expandable={false} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {grouped.legit.length ? (
          <div>
            <div className="mb-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">Allowlisted legit ({grouped.legit.length})</div>
            <ul className="space-y-2">
              {grouped.legit.map((p) => (
                <li key={`l-${p}`}>
                  <PermissionChip name={p} tone="success" description={describePermission(p)} expandable={false} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {grouped.others.length ? (
          <div>
            <div className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-300">Others ({grouped.others.length})</div>
            <ul className="space-y-2">
              {grouped.others.map((p) => (
                <li key={`o-${p}`}>
                  <PermissionChip name={p} description={describePermission(p)} expandable={false} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {overflow ? (
          <>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/95 via-white/70 to-transparent dark:from-slate-800/95 dark:via-slate-800/70 dark:to-transparent" />
            <div className="absolute bottom-1 left-0 right-0 flex justify-center">
              <button onClick={onOpenModal} className="rounded-full bg-slate-900 dark:bg-slate-100 px-3 py-1.5 text-xs font-medium text-white dark:text-slate-900 shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200">View all permissions</button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}



function describePermission(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('send_sms')) return 'Send SMS messages; used for 2FA or verification.';
  if (n.includes('receive_sms') || n.includes('read_sms')) return 'Receive or read SMS for OTP auto-fill.';
  if (n.includes('camera')) return 'Access the device camera for QR/document scanning.';
  if (n.includes('record_audio') || n.includes('microphone')) return 'Record audio via microphone.';
  if (n.includes('fine_location')) return 'Access precise GPS location.';
  if (n.includes('coarse_location')) return 'Access approximate location.';
  if (n.includes('internet') || n.includes('network')) return 'Full internet access.';
  if (n.includes('network_state') || n.includes('wifi_state')) return 'View network/Wi‑Fi status.';
  if (n.includes('write_external_storage') || n.includes('manage_external_storage')) return 'Write files to external storage.';
  if (n.includes('post_notifications')) return 'Post notifications to the user.';
  if (n.includes('wake_lock')) return 'Keep device awake for background tasks.';
  if (n.includes('read_phone_state')) return 'Read phone state (e.g., network info, device id depending on SDK).';
  return 'Android permission requested by the app.';
}

