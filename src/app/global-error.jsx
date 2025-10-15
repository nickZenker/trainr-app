'use client'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Leichtes Client-Logging, Server-Logging übernimmt /api/log
    // eslint-disable-next-line no-console
    console.error('[GLOBAL-ERROR]', error?.message)
    fetch('/api/log', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind: 'global-error', message: String(error?.message), stack: String(error?.stack) }),
    }).catch(() => {})
  }, [error])

  return (
    <html>
      <body className="p-6 text-sm">
        <div className="max-w-xl mx-auto border rounded-lg p-4">
          <h1 className="text-lg font-semibold mb-2">Uups, da lief was schief.</h1>
          <p className="opacity-80 mb-4">Die Seite konnte nicht geladen werden. Versuch's erneut.</p>
          <button onClick={() => reset()} className="px-3 py-1.5 rounded-md border">Neu laden</button>
        </div>
      </body>
    </html>
  )
}