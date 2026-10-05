// Fechas del backend: ISO 8601 (created_at) o formato MySQL
// "2026-07-27 23:52:09" (columnas pivote como last_accessed_at). Se convierte
// el espacio a "T" para que todos los navegadores lo parseen.
export function formatDate(value) {
  if (!value) return null
  const text = String(value)
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}
