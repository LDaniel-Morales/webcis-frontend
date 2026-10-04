// YA NO SE USA EN ProfileView: bio, número de control, medallas y actividad
// salen de GET /profile (stores/profile.js). Solo lo importa AllMedalsModal
// (selección de medallas destacadas), desconectado hasta que el backend
// exponga el listado completo de medallas con id. Ver MedalsCard.vue.

export const MOCK_BIO =
  'Estudiante de Ingeniería en Sistemas Computacionales. Me interesa el desarrollo web y las estructuras de datos.'

export const MOCK_CONTROL_NUMBER = '20E30245'

// Catálogo de medallas mock. `id` es estable a propósito: useFeaturedMedals
// lo persiste en localStorage, así que renombrar/reordenar esta lista no
// debe cambiar los ids de entradas existentes.
export const MOCK_MEDALS = [
  { id: 'principios-poo', label: 'Principios_POO', completedAt: '2026-03-12', category: 'poo' },
  { id: 'estructuras-datos', label: 'Estructuras_Datos', completedAt: '2026-02-02', category: 'datos' },
  { id: 'desarrollo-web', label: 'Desarrollo_Web', completedAt: '2026-01-18', category: 'web' },
  { id: 'algoritmos-1', label: 'Algoritmos I', completedAt: '2025-11-30', category: 'algoritmo' },
  { id: 'bases-de-datos', label: 'Bases de Datos', completedAt: '2025-10-14', category: 'datos' },
  { id: 'fundamentos-cpp', label: 'Fundamentos C++', completedAt: '2025-08-20', category: 'poo' },
  { id: 'redes-1', label: 'Redes I', completedAt: '2025-07-05', category: 'web' },
  { id: 'calculo-aplicado', label: 'Cálculo Aplicado', completedAt: '2025-05-15', category: 'algoritmo' },
]

export const MEDAL_CATEGORY_CLASSES = {
  poo: { bg: 'bg-tag-poo-bg', fg: 'text-tag-poo-fg' },
  datos: { bg: 'bg-tag-datos-bg', fg: 'text-tag-datos-fg' },
  web: { bg: 'bg-tag-web-bg', fg: 'text-tag-web-fg' },
  algoritmo: { bg: 'bg-tag-algoritmo-bg', fg: 'text-tag-algoritmo-fg' },
}

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function formatCompletedDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`)
  return `Completado ${date.getDate()} ${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`
}

// Feed de actividad reciente: no hay ningún endpoint de actividad en el
// backend (ver nota arriba), `time` queda como texto fijo en vez de
// calcularse a partir de una fecha real porque no hay timestamp real que
// formatear todavía.
export const MOCK_ACTIVITY = [
  { text: 'completó el curso Principios_POO y obtuvo una medalla.', time: 'hace 3 días', kind: 'medalla' },
  { text: 'se inscribió al curso Estructuras_Datos.', time: 'hace 1 semana', kind: 'curso' },
  { text: 'descargó el material Manual de POO en C++.', time: 'hace 2 semanas', kind: 'material' },
  { text: 'actualizó su foto de perfil.', time: 'hace 3 semanas', kind: 'perfil' },
]
