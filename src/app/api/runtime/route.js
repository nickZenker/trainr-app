export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const region = process.env.VERCEL_REGION || "local";
    
    return Response.json({
      ok: true,
      runtime: "nodejs",
      region
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}

