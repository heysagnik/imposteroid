export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { job_id: string } }): Promise<Response> {
  const { job_id } = params;
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
  } catch (error: any) {
    return Response.json({ message: error?.message || 'Result proxy error' }, { status: 500 });
  }
}


