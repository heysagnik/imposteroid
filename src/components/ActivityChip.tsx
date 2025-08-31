'use client';

import React, { useEffect, useRef, useState } from 'react';

export function ActivityChip({
  name,
  description,
  expandable = true,
}: {
  name: string;
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

  return (
    <div>
      <button
        type="button"
        onClick={expandable ? () => setOpen((v) => !v) : undefined}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"
        aria-expanded={expandable ? open : undefined}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`transition ${expandable && open ? 'rotate-45' : ''}`}>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <code className="text-slate-700 dark:text-slate-300">{name}</code>
      </button>
      {expandable && description ? (
        <div
          className={`overflow-hidden transition-[max-height,opacity,margin] duration-200 ease-out ${open ? 'opacity-100 mt-2' : 'opacity-0'}`}
          style={{ maxHeight: open ? contentHeight : 0 }}
          aria-hidden={!open}
        >
          <div ref={contentRef} className="rounded-md border border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-[12px] text-slate-600 dark:text-slate-400">
            {description}
          </div>
        </div>
      ) : null}
    </div>
  );
}


