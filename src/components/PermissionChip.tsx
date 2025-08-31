'use client';

import React, { useEffect, useRef, useState } from 'react';

export function PermissionChip({
  name,
  tone = 'neutral',
  description,
  expandable = true,
}: {
  name: string;
  tone?: 'neutral' | 'danger' | 'success' | 'warning';
  description?: string;
  expandable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (!expandable) return;
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setContentHeight(el.scrollHeight);
    measure();
    const RO: any = (window as any).ResizeObserver;
    let ro: any;
    if (RO) { ro = new RO(measure); ro.observe(el); }
    window.addEventListener('resize', measure);
    return () => { if (ro && el) ro.unobserve(el); window.removeEventListener('resize', measure); };
  }, [expandable, description, name]);
  
  const toneClasses =
    tone === 'danger'
      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      : tone === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
      : tone === 'warning'
      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
      : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={expandable ? () => setOpen((v) => !v) : undefined}
        className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 ${toneClasses}`}
        aria-expanded={expandable ? open : undefined}
      >
        <PermissionIcon name={name} />
        <span className="font-medium">{name}</span>
        {expandable ? (
          <svg className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
        ) : null}
      </button>
      {expandable && description ? (
        <div
          className={`overflow-hidden transition-[max-height,opacity,margin] duration-200 ease-out ${open ? 'opacity-100 mt-2' : 'opacity-0'}`}
          style={{ maxHeight: open ? contentHeight : 0 }}
          aria-hidden={!open}
        >
          <div ref={contentRef} className="rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
            {description}
          </div>
        </div>
      ) : null}
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

function IconCamera() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 5h-3.2l-1.8-2H9L7.2 5H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
      <circle cx="12" cy="13" r="2.5" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17.3 11c0 2.98-2.42 5.41-5.4 5.41S6.5 13.98 6.5 11H5c0 3.59 2.62 6.57 6 7.19V21h2v-2.81c3.38-.62 6-3.6 6-7.19h-1.2z" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  );
}

function IconSms() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 11h10v2H7v-2zm6-3H7V6h6v2z" />
    </svg>
  );
}

function IconNetwork() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9z" />
      <path d="M9 17l3 3 3-3c-1.65-1.66-4.34-1.66-6 0z" />
      <path d="M5 13l2 2c2.76-2.76 7.24-2.76 10 0l2-2c-4.28-4.28-11.72-4.28-14 0z" />
    </svg>
  );
}


function IconStorage() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6H4zm0 10v2c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2H4z" />
      <path d="M4 4h16v2H4z" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zM18 16v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

