import { NextResponse } from "next/server";

// GET /api/health - Health check endpoint
export async function GET() {
  const healthData = {
    ok: true,
    time: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY
    }
  };

  return NextResponse.json(healthData, { status: 200 });
}
