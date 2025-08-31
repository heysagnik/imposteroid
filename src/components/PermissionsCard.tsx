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
    const RO: any = (window as any).ResizeObserver;
    let ro: any;
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

function PermissionIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('camera')) return <IconCamera />;
  if (n.includes('audio') || n.includes('record_audio') || n.includes('microphone')) return <IconMic />;
  if (n.includes('location') || n.includes('fine_location') || n.includes('coarse_location')) return <IconLocation />;
  if (n.includes('sms')) return <IconSms />;
  if (n.includes('internet') || n.includes('network')) return <IconNetwork />;
  if (n.includes('storage') || n.includes('external_storage')) return <IconStorage />;
  if (n.includes('notifications')) return <IconBell />;
  return <IconShield />;
}

function IconCamera() { return (<svg className="h-3.5 w-3.5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M9 7l1.2-1.6A2 2 0 0 1 11.79 4h.42a2 2 0 0 1 1.59.8L15 7h2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h2Zm3 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg>); }
function IconMic() { return (<svg className="h-3.5 w-3.5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V20H9v2h6v-2h-2v-2.08A7 7 0 0 0 19 11h-2Z"/></svg>); }
function IconLocation() { return (<svg className="h-3.5 w-3.5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>); }
function IconSms() { return (<svg className="h-3.5 w-3.5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h2v3l4-3h10a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H4Zm3 5h10v2H7v-2Zm0-4h10v2H7V6Z"/></svg>); }
function IconNetwork() { return (<svg className="h-3.5 w-3.5 text-slate-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 0 0-9 9h2a7 7 0 0 1 14 0h2a9 9 0 0 0-9-9Zm0 4a5 5 0 0 0-5 5h2a3 3 0 0 1 6 0h2a5 5 0 0 1 0 5Zm0 4a1 1 0 0 0-1 1v8h2v-8a1 1 0 0 0-1-1Z"/></svg>); }
function IconStorage() { return (<svg className="h-3.5 w-3.5 text-amber-600" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v4H4V5Zm0 5h16v4H4v-4Zm0 5h16v4H4v-4Z"/></svg>); }
function IconBell() { return (<svg className="h-3.5 w-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"/></svg>); }
function IconShield() { return (<svg className="h-3.5 w-3.5 text-slate-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v6c0 5 3.4 9.74 8 11 4.6-1.26 8-6 8-11V5l-8-3Z"/></svg>); }


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

