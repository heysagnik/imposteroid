'use client';

import React, { useEffect, useReducer, useRef } from 'react';

import { bytesToReadable, formatSpeed, formatDuration } from '../app/page-utils';

type Phase = 'idle' | 'uploading' | 'queued' | 'processing' | 'complete' | 'error';

interface AnalysisResult {
  identity: { packageName?: string; version?: string };
  certificate?: { valid?: boolean; issuer?: string };
  risk?: { permissions?: string[]; obfuscated?: boolean };
}

interface AnalysisState {
  phase: Phase;
  uploadProgress: number;
  uploadLoaded: number;
  uploadTotal: number;
  uploadSpeedBps: number;
  uploadEtaSec: number | null;
  processingProgress: number;
  processingStage: string | null;
  error: string | null;
  startedProcessing: boolean;
  loading: boolean;
}

const initialAnalysis: AnalysisState = {
  phase: 'idle',
  uploadProgress: 0,
  uploadLoaded: 0,
  uploadTotal: 0,
  uploadSpeedBps: 0,
  uploadEtaSec: null,
  processingProgress: 0,
  processingStage: null,
  error: null,
  startedProcessing: false,
  loading: false,
};

type AnalysisAction =
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'UPLOAD_PROGRESS'; loaded: number; total: number; bps: number; eta: number | null }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'SET_STAGE'; stage: string }
  | { type: 'ADVANCE_PROCESSING' }
  | { type: 'COMPLETE' }
  | { type: 'RESET_UPLOAD_SIM'; pct?: number };

function analysisReducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase, loading: action.phase !== 'complete' && action.phase !== 'error' };
    case 'UPLOAD_PROGRESS':
      return {
        ...state,
        uploadLoaded: action.loaded,
        uploadTotal: action.total,
        uploadProgress: Math.min(100, Math.round((action.loaded / action.total) * 100)),
        uploadSpeedBps: action.bps,
        uploadEtaSec: action.eta,
      };
    case 'SET_ERROR':
      return { ...state, error: action.message, phase: 'error', loading: false };
    case 'SET_STAGE':
      return { ...state, processingStage: action.stage };
    case 'ADVANCE_PROCESSING':
      return { ...state, phase: state.phase === 'queued' ? 'processing' : state.phase, startedProcessing: true, processingProgress: Math.min(100, state.processingProgress + 15) };
    case 'COMPLETE':
      return { ...state, processingProgress: 100, phase: 'complete', loading: false };
    case 'RESET_UPLOAD_SIM':
      return { ...state, uploadProgress: action.pct ?? state.uploadProgress };
    default:
      return state;
  }
}

export function AnalysisSection({ file, onResults }: { file: File; onResults: (r: AnalysisResult) => void }) {
  const [state, dispatch] = useReducer(analysisReducer, initialAnalysis);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    let cancelled = false;
    let simulateId: number | null = null;
    let xhr: XMLHttpRequest | null = null;

    async function start() {
      dispatch({ type: 'SET_PHASE', phase: 'uploading' });
      dispatch({ type: 'RESET_UPLOAD_SIM' });
      const formData = new FormData();
      formData.append('apk', file);

      xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      let lastTs = Date.now();
      let lastLoadedLocal = 0;

      simulateId = window.setInterval(() => {
        dispatch({ type: 'RESET_UPLOAD_SIM' });
      }, 1000);

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const now = Date.now();
        const deltaBytes = e.loaded - lastLoadedLocal;
        const deltaMs = now - lastTs;
        const bps = deltaMs > 0 && deltaBytes >= 0 ? (deltaBytes / deltaMs) * 1000 : 0;
        const remaining = Math.max(0, e.total - e.loaded);
        const eta = bps > 0 ? Math.round(remaining / bps) : null;
        lastTs = now;
        lastLoadedLocal = e.loaded;
        dispatch({ type: 'UPLOAD_PROGRESS', loaded: e.loaded, total: e.total, bps, eta });
      };

      const uploadPromise = new Promise<{ job_id?: string }>((resolve, reject) => {
        xhr!.onload = () => {
          try {
            if (xhr!.status >= 200 && xhr!.status < 300) resolve(JSON.parse(xhr!.responseText || '{}'));
            else reject(new Error('Upload failed'));
          } catch (err) {
            reject(err);
          }
        };
        xhr!.onerror = () => reject(new Error('Upload network error'));
        xhr!.onabort = () => reject(new Error('Upload aborted'));
      });

      xhr.send(formData);

      let jobId: string | undefined;
      try {
        const uploadJson = await uploadPromise;
        jobId = uploadJson.job_id;
        if (!jobId) throw new Error('Missing job_id in response');
      } catch (error) {
        const err = error as { message?: string } | undefined;
        if (cancelled) return;
        if (simulateId) { clearInterval(simulateId); simulateId = null; }
        dispatch({ type: 'SET_ERROR', message: err?.message || 'Upload failed' });
        return;
      }

      // polling removed per request; client-side upload progress is driven by XHR onprogress

      if (cancelled) return;
      dispatch({ type: 'SET_PHASE', phase: 'queued' });

      const startTime = Date.now();
      const timeoutMs = 2 * 60 * 1000;
      let lastSignature: string | null = null;

      while (!cancelled && Date.now() - startTime < timeoutMs) {
        try {
          const res = await fetch(`/api/result/${jobId}`, { signal: abortRef.current?.signal, cache: 'no-store' });
          if (!res.ok) {
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          const json = await res.json();
          const status: string | undefined = json?.status;
          const stage: string | undefined = json?.stage || json?.progress?.stage;
          const sig = `${status || ''}::${stage || ''}`;
          if (sig !== lastSignature) {
            dispatch({ type: 'ADVANCE_PROCESSING' });
            lastSignature = sig;
          }
          if (stage) dispatch({ type: 'SET_STAGE', stage });
          if (status === 'processing' || status === 'running') dispatch({ type: 'SET_PHASE', phase: 'processing' });
          if (status === 'complete') {
            dispatch({ type: 'COMPLETE' });
            onResults(json.result ?? json);
            return;
          }
          if (status === 'failed' || status === 'error') {
            dispatch({ type: 'SET_ERROR', message: json?.message || 'Analysis failed' });
            return;
          }
          await new Promise((r) => setTimeout(r, 2000));
        } catch {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
      if (!cancelled) dispatch({ type: 'SET_ERROR', message: 'Timed out waiting for result' });
    }

    start();

    return () => {
      cancelled = true;
      abortRef.current?.abort();
      xhr?.abort();
      if (simulateId) clearInterval(simulateId);
    };
  }, [file, onResults]);

  const {
    phase,
    uploadProgress,
    uploadLoaded,
    uploadTotal,
    uploadSpeedBps,
    uploadEtaSec,
    processingProgress,
    processingStage,
    error,
    loading,
  } = state;

  if (loading && phase === 'uploading') {
    return (
      <div className="mx-auto mt-0 w-full rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Uploading APK</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{uploadProgress}%</div>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
          <div className="h-2 rounded-full bg-slate-900 dark:bg-slate-100 transition-all" style={{ width: `${uploadProgress}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400" aria-live="polite">
          <div>
            <div className="text-slate-500 dark:text-slate-400">Transferred</div>
            <div className="font-medium">{bytesToReadable(uploadLoaded)} / {bytesToReadable(uploadTotal || file.size)}</div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">Speed</div>
            <div className="font-medium">{formatSpeed(uploadSpeedBps)}</div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">ETA</div>
            <div className="font-medium">{uploadEtaSec != null ? formatDuration(uploadEtaSec) : '—'}</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && phase === 'queued') {
    return (
      <div className="mx-auto w-full rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Queued</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Waiting…</div>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
          <div className="h-2 w-1/12 rounded-full bg-slate-300 dark:bg-slate-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (loading && phase === 'processing') {
    return (
      <div className="mx-auto w-full rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Analyzing APK</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{processingProgress}%</div>
        </div>
        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400" aria-live="polite">{processingStage || 'Starting…'}</div>
        <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
          <div className="h-2 rounded-full bg-slate-900 dark:bg-slate-100 transition-all" style={{ width: `${processingProgress}%` }} />
        </div>
      </div>
    );
  }

  if (error) return <div className="mt-4 text-center text-red-600 dark:text-red-400">Error: {error}</div>;

  return null;
}

export default AnalysisSection;


