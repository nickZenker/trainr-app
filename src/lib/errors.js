export function toMessage(err) {
  if (!err) return 'Unbekannter Fehler'
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message || String(err)
  try { return JSON.stringify(err) } catch { return String(err) }
}
