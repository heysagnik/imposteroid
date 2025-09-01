export function bytesToReadable(size: number) {
  const mb = size / (1024 * 1024);
  if (mb < 1) return `${Math.round(size / 1024)} KB`;
  return `${mb.toFixed(1)} MB`;
}

export function formatSpeed(bps: number) {
  if (!bps || bps <= 0) return '—';
  const kbps = bps / 1024;
  const mbps = kbps / 1024;
  if (mbps >= 1) return `${mbps.toFixed(2)} MB/s`;
  if (kbps >= 1) return `${kbps.toFixed(0)} KB/s`;
  return `${bps.toFixed(0)} B/s`;
}

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}


