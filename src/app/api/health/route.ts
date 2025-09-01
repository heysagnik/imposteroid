export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50000);
    const upstream = await fetch('https://fakeapk.onrender.com/health', { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);

    if (!upstream.ok) {
      return Response.json({ status: 'bad_upstream', code: upstream.status }, { status: 502 });
    }

    const json = await upstream.json().catch(() => null);
    return Response.json(json ?? { status: 'unknown' }, { status: 200, headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    // Narrow unknown error and safely access properties
    const err = error as { name?: string; message?: string } | undefined;
    if (err?.name === 'AbortError') return Response.json({ status: 'timeout' }, { status: 504 });
    return Response.json({ status: 'error', message: err?.message || 'request failed' }, { status: 502 });
  }
}


