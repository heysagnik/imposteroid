'use client';

import React from 'react';
import { Field } from './ui';

export function IdentityCard({ identity }: { identity: { appName?: string | null; packageName?: string | null; versionName?: string | null; versionCode?: string | null; apkHash?: string | null; certificateSha256?: string | null; trust?: string | null } }) {
  return (
    <div className="bento-card md:col-span-2 lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Identity</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Field label="App Name" value={identity?.appName || undefined} />
        <Field label="Package" value={identity?.packageName || undefined} mono />
        <Field label="Version" value={`${identity?.versionName ?? '-'} (${identity?.versionCode ?? '-'})`} />
        <Field label="APK SHA-256" value={identity?.apkHash || undefined} mono truncate />
        <Field label="Cert SHA-256" value={identity?.certificateSha256 || undefined} mono truncate />
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Trust</div>
          {identity?.trust ? (
            <span className="mt-1 inline-block">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium
                  ${
                    identity.trust === 'trusted'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                      : identity.trust === 'untrusted'
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                  }
                `}
              >
                {identity.trust === 'trusted' ? (
                  <svg className="mr-1 h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 20 20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l4 4L15 7" />
                  </svg>
                ) : identity.trust === 'untrusted' ? (
                  <svg className="mr-1 h-4 w-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 20 20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M6 14L14 6" />
                  </svg>
                ) : (
                  <svg className="mr-1 h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                )}
                {identity.trust.charAt(0).toUpperCase() + identity.trust.slice(1)}
              </span>
            </span>
          ) : (
            <div className="mt-1 text-slate-900 dark:text-slate-100 text-sm">-</div>
          )}
        </div>
      </div>
    </div>
  );
}


