export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to get build hash (safe fallback)
function getBuildHash() {
  try {
    // Try Vercel environment first
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      return process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 8);
    }
    
    // Try git command as fallback (may not be available in all environments)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require('child_process');
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 8);
  } catch {
    // If all fails, return null (not an error)
    return null;
  }
}

export async function GET() {
  try {
    const payload = {
      ok: true,
      time: new Date().toISOString(),
      buildHash: getBuildHash(),
      env: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
        NODE_ENV: !!process.env.NODE_ENV,
        NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
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
      buildHash: null,
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}
