'use client'
export default function Error({ error, reset }) {
  return (
    <div className="p-4">
      <div className="border rounded-md p-3">
        <strong>Fehler in dieser Ansicht</strong>
        <p className="opacity-80 text-sm mt-1">{String(error?.message || 'Unbekannter Fehler')}</p>
        <button onClick={() => reset()} className="mt-3 px-3 py-1.5 rounded-md border">Erneut versuchen</button>
      </div>
    </div>
  )
}