export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    if (!formData.get('apk')) {
      return Response.json({ message: 'Missing file field "apk"' }, { status: 400 });
    }

    const upstream = await fetch('https://fakeapk.onrender.com/upload', {
      method: 'POST',
      body: formData,
      // Let upstream set its own headers; avoid CORS issues by responding from same origin
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
    return Response.json({ message: error?.message || 'Upload proxy error' }, { status: 500 });
  }
}


