export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const buildHash = process.env.VERCEL_GIT_COMMIT_SHA || "dev";
    const nodeVersion = process.version;
    const timestamp = new Date().toISOString();
    
    return Response.json({
      ok: true,
      buildHash,
      node: nodeVersion,
      time: timestamp
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}

