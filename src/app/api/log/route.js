import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'

export async function POST(req) {
  try {
    const body = await req.json()
    const ts = new Date().toISOString()
    const line = `### [SERVER-LOG] ${ts}\n- kind: ${body?.kind}\n- message: ${body?.message}\n- stack: ${body?.stack?.split('\\n').slice(0,6).join('\\n')}\n\n`
    await fs.appendFile('ops/OUTBOX.md', line, 'utf8')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
