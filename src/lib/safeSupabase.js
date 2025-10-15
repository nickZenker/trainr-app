export function isMissingColumn(err) {
  const msg = String(err?.message || err)
  return msg.includes('column') && msg.includes('does not exist') || String(err?.code) === '42703'
}

export function normalizeDbError(err) {
  if (isMissingColumn(err)) return new Error('DB schema mismatch (missing column)')
  return err instanceof Error ? err : new Error(String(err))
}

export async function safeInsert(q, { retryWithout = [] } = {}) {
  try {
    const { data, error } = await q
    if (error) throw error
    return { data }
  } catch (e) {
    if (retryWithout.length && isMissingColumn(e)) {
      // Entferne Felder und nochmal versuchen
      const { table, values, client } = q.__ctx || {}
      if (client && table && values) {
        const cleaned = Object.fromEntries(Object.entries(values).filter(([k]) => !retryWithout.includes(k)))
        const { data, error } = await client.from(table).insert(cleaned).select('id').single()
        if (error) throw error
        return { data }
      }
    }
    throw normalizeDbError(e)
  }
}
