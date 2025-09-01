'use client';

import React from 'react';

export default function UploadZone({
  children,
  onOpenPicker,
  className = '',
}: {
  children: React.ReactNode;
  onOpenPicker?: () => void;
  className?: string;
}) {
  return (
    <div className={`group relative mx-auto w-full max-w-2xl cursor-pointer rounded-2xl border border-dashed bg-white/70 dark:bg-slate-800/70 p-6 sm:p-8 text-left shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none ${className}`} onClick={onOpenPicker}>
      {children}
    </div>
  );
}


