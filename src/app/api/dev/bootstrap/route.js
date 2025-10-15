import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      return NextResponse.json({ ok:false, error:'missing env' }, { status: 200 });
    }
    const admin = createClient(url, key, { auth: { autoRefreshToken:false, persistSession:false }});

    const email = 'test.user@trainr.local';
    const password = 'Trainr!123'; // nur Dev
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // bestätigt, um Mail-Flow zu umgehen
      user_metadata: { role: 'e2e' },
    });
    if (error && !String(error.message).includes('already registered')) {
      return NextResponse.json({ ok:false, error: error.message }, { status: 200 });
    }
    return NextResponse.json({ ok:true, email, note:'user ensured' }, { status: 200 });
  } catch (_e) {
    return NextResponse.json({ ok:false, error:'bootstrap failed' }, { status: 200 });
  }
}
