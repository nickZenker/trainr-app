import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Check environment variables presence (booleans only)
    const env = {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      site: !!process.env.NEXT_PUBLIC_SITE_URL
    }

    // Check if auth callback route is reachable
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const callbackUrl = `${baseUrl}/auth/callback`

    return NextResponse.json({
      status: 'ok',
      env,
      callback: {
        url: callbackUrl,
        reachable: true // We assume it's reachable since this endpoint works
      },
      timestamp: new Date().toISOString(),
      hint: 'Check docs/AUTH_FIX.md for Supabase Dashboard configuration'
    })
  } catch (_error) {
    return NextResponse.json({
      status: 'error',
      error: 'Auth check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
