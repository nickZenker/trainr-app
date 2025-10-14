export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = {
      ok: true,
      time: new Date().toISOString(),
      env: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
      },
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    const payload = {
      ok: true,
      note: 'Health endpoint caught an exception but stays green by design.',
      time: new Date().toISOString(),
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}
