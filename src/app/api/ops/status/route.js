import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const root = process.cwd();
    const statusPath = path.join(root, 'ops', 'STATUS.json');
    const outboxPath = path.join(root, 'ops', 'OUTBOX.md');

    let status = null;
    try {
      const s = await fs.readFile(statusPath, 'utf8');
      status = JSON.parse(s);
    } catch {
      // STATUS.json nicht vorhanden oder ungültig - das ist ok
    }

    let outTail = '';
    try {
      const o = await fs.readFile(outboxPath, 'utf8');
      const lines = o.split('\n');
      outTail = lines.slice(-80).join('\n');
    } catch {
      // OUTBOX.md nicht vorhanden - das ist ok
    }

    return NextResponse.json({
      ok: true,
      status,
      outbox_tail: outTail,
      updatedAt: new Date().toISOString()
    });
  } catch (_e) {
    return NextResponse.json({
      ok: false,
      error: 'ops status read failed'
    });
  }
}

