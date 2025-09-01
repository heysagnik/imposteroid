export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ job_id: string }> }): Promise<Response> {
  // `params` may be a promise in the runtime; await it before accessing properties
  const resolvedParams = await params as { job_id: string };
  const { job_id } = resolvedParams;
  if (!job_id) {
    return Response.json({ message: 'Missing job_id' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`https://fakeapk.onrender.com/result/${encodeURIComponent(job_id)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        'content-type': contentType,
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    const err = error as { message?: string } | undefined;
    return Response.json({ message: err?.message || 'Result proxy error' }, { status: 500 });
  }
}


