// Client-side download helpers for CSV / JSON exports.
// PDF and Excel binary generation is intentionally out of scope for this rewrite
// (see DEPLOY.md); for now, exports are limited to JSON and CSV.

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function toJsonBlob(rows: unknown[]): Blob {
  return new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json;charset=utf-8' })
}

export function toCsvBlob(rows: Record<string, unknown>[]): Blob {
  if (rows.length === 0) return new Blob([''], { type: 'text/csv;charset=utf-8' })
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return ''
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))]
  // BOM so Excel opens UTF-8 correctly.
  return new Blob(['\uFEFF', lines.join('\n')], { type: 'text/csv;charset=utf-8' })
}