'use client';

import React, { useEffect } from 'react';
import { PermissionChip } from './PermissionChip';


export function PermissionsModal({
  open,
  onClose,
  grouped,
}: {
  open: boolean;
  onClose: () => void;
  grouped: { suspicious: string[]; legit: string[]; others: string[] };
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
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">All Permissions</h3>
          <button onClick={onClose} className="rounded-full border border-slate-300 dark:border-slate-500 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Close</button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5 no-scrollbar">
          {grouped.suspicious.length ? (
            <div className="mb-5">
              <div className="mb-2 text-xs font-medium text-red-700 dark:text-red-400">Suspicious ({grouped.suspicious.length})</div>
              <ul className="space-y-2">
                {grouped.suspicious.map((p) => (
                  <li key={`ms-${p}`}>
                    <PermissionChip name={p} tone="danger" description={describePermission(p)} expandable={true} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {grouped.legit.length ? (
            <div className="mb-5">
              <div className="mb-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">Allowlisted legit ({grouped.legit.length})</div>
              <ul className="space-y-2">
                {grouped.legit.map((p) => (
                  <li key={`ml-${p}`}>
                    <PermissionChip name={p} tone="success" description={describePermission(p)} expandable={true} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {grouped.others.length ? (
            <div className="mb-2">
              <div className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-300">Others ({grouped.others.length})</div>
              <ul className="space-y-2">
                {grouped.others.map((p) => (
                  <li key={`mo-${p}`}>
                    <PermissionChip name={p} description={describePermission(p)} expandable={true} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
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

