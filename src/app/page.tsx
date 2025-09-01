'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../components/ThemeToggle';
import AnalysisSection from '../components/AnalysisSection';
import Image from 'next/image';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB
const ALLOWED_TYPES = [
  'application/vnd.android.package-archive',
  'application/zip',
  'application/octet-stream',
];




function UploadSection({
  onSelect,
  selectedFile,
  onResults,
}: {
  onSelect: (file: File) => void;
  selectedFile?: File | null;
  onResults?: (results: unknown) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const validateAndSelect = useCallback(
    (file?: File | null) => {
      setError(null);
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.apk')) {
        setError('Select a .apk file.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large (max ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB).`);
        return;
      }
      if (
        file.type &&
        !ALLOWED_TYPES.includes(file.type) &&
        !file.name.toLowerCase().endsWith('.apk')
      ) {
        setError('Unsupported file type.');
        return;
      }
      onSelect(file);
    },
    [onSelect]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      validateAndSelect(f);
      // reset input to allow re-selecting same file
      e.currentTarget.value = '';
    },
    [validateAndSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      validateAndSelect(e.dataTransfer.files?.[0] ?? null);
    },
    [validateAndSelect]
  );

  useEffect(() => {
    const prevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  return (
    <section
      className="w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-20"
      aria-label="Imposteroid APK Analyzer"
    >
      <div className="sunlight-top" />
      <div className="theme-toggle-container">
        <ThemeToggle />
      </div>

      <div className="relative max-w-3xl mx-auto w-full">
        <div className="pointer-events-none absolute -inset-x-20 -top-24 -z-10 h-48 bg-gradient-to-r from-blue-100 via-sky-100 to-cyan-100 blur-2xl dark:from-blue-900/20 dark:via-sky-900/20 dark:to-cyan-900/20" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          Detect Fake Android Apps
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
          Analyze APK identity, certificates, and permissions to spot imposters.
        </p>

        <div className="mt-8 sm:mt-10">
          {!selectedFile && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragging(false);
              }}
              onDrop={onDrop}
              onClick={openPicker}
              role="button"
              aria-label="Upload or drop APK file"
              className={`group relative mx-auto w-full max-w-2xl cursor-pointer rounded-2xl border border-dashed bg-white/70 dark:bg-slate-800/70 p-6 sm:p-8 text-left shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-600 ${
                dragging
                  ? 'border-blue-400 bg-sky-50 dark:bg-sky-900/20 ring-4 ring-blue-100 dark:ring-blue-900/20'
                  : 'border-slate-200 dark:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl transition ${
                    dragging ? 'bg-blue-600' : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      dragging ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                    }`}
                    aria-hidden="true"
                  >
                    <path d="M12 16a1 1 0 0 1-1-1V9.41l-1.3 1.3a1 1 0 1 1-1.4-1.42l3-3a1 1 0 0 1 1.4 0l3 3a1 1 0 0 1-1.4 1.42L13 9.4V15a1 1 0 0 1-1 1Z" />
                    <path d="M6 20a4 4 0 0 1-4-4 4.1 4.1 0 0 1 3-3.87 6 6 0 0 1 11.62-1.54A4.5 4.5 0 0 1 22 15.5 4.5 4.5 0 0 1 17.5 20H6Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100">
                    Drop your APK here or{' '}
                    <span className="text-blue-600 dark:text-blue-400 underline-offset-2 group-hover:underline">
                      browse
                    </span>
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Only .apk files up to {Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB
                  </p>
                </div>
              </div>

              

              <input
                ref={inputRef}
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                onChange={onInputChange}
                className="hidden"
                aria-hidden="true"
              />

              {error && (
                <div
                  role="alert"
                  className="mt-3 text-sm font-medium text-red-600 dark:text-red-400"
                >
                  {error}
                </div>
              )}
            </div>
          )}

          {selectedFile && (
            <div className="mx-auto w-full max-w-2xl">
            
              <AnalysisSection
                file={selectedFile}
                onResults={(r) => onResults && onResults(r)}
              />
            </div>
          )}
        </div>

        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-left max-w-2xl mx-auto">
          {[
            {
              t: 'Identity',
              d: 'Check package names and branding.',
              icon: (
                
                <Image
                  src="/fingerprint.png"
                  alt="Identity"
                  width={20}
                  height={20}
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                />
              ),
            },
            {
              t: 'Certificate',
              d: 'Verify signing and repack signs.',
              icon: (
                
                <Image
                  src="/certificate.png"
                  alt="Certificate"
                  width={20}
                  height={20}
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                />
              ),
            },
            {
              t: 'Risk',
              d: 'Flag permissions and obfuscation.',
              icon: (
                
                <Image
                  src="/compliance.png"
                  alt="Risk"
                  width={20}
                  height={20}
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                />
              ),
            },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-xl border border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
                {f.icon}
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {f.t}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {f.d}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 sm:mt-10 text-[11px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Upload authorized APKs only. Heuristic results; not definitive malware detection.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  const [apkFile, setApkFile] = useState<File | null>(null);
  const router = useRouter();
  const [, setHealth] = useState<unknown | null>(null);

  // One-time health check (quietly stored)
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 50000);

    (async () => {
      try {
        const res = await fetch('/api/health', { signal: controller.signal });
        if (!mounted) return;
        if (!res.ok) {
          setHealth({ status: 'unhealthy', code: res.status });
          return;
        }
        const json = await res.json();
        if (mounted) setHealth(json);
      } catch (error) {
        const err = error as { message?: string } | undefined;
        if (mounted) setHealth({ status: 'error', message: err?.message || 'request failed' });
      } finally {
        clearTimeout(timeout);
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const handleSelect = useCallback((file: File) => setApkFile(file), []);
  const handleResults = useCallback(
    (results: unknown) => {
      localStorage.setItem('analysisResults', JSON.stringify(results));
      router.push('/result');
    },
    [router]
  );

  return (
    <main className="relative min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center">
      <UploadSection
        onSelect={handleSelect}
        selectedFile={apkFile}
        onResults={handleResults}
      />
    </main>
  );
}
