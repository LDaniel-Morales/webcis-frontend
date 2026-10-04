// Fechas del backend: ISO 8601 (created_at) o formato MySQL
// "2026-07-27 23:52:09" (columnas pivote como last_accessed_at). Se convierte
// el espacio a "T" para que todos los navegadores lo parseen.
export function formatDate(value) {
  if (!value) return null
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}
