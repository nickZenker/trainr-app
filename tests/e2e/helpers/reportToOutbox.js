import fs from 'node:fs/promises'
export async function writeFailLog(title, logs=[]) {
  const ts = new Date().toISOString()
  const head = `### [E2E-FAIL] ${ts} - ${title}\n`
  const body = '```\n' + logs.slice(-80).join('\n') + '\n```\n\n'
  await fs.appendFile('ops/OUTBOX.md', head + body, 'utf8')
}
