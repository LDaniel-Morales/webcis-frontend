import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getCourses } from '@/services/course.service'

// Todos los filtros de GET /courses, con los nombres y límites de
// CourseIndexRequest:
// - page ≥ 1, per_page 1-50
// - search ≤ 100 caracteres (título, descripción o código)
// - categories[] / subjects[]: 1-5 códigos existentes (cat_code / sub_code)
// - created_from / created_to: fechas (YYYY-MM-DD), from ≤ to
// - sort: title | created_at | updated_at
// - order: asc | desc
export const SORT_OPTIONS = ['title', 'created_at', 'updated_at']
export const ORDER_OPTIONS = ['asc', 'desc']
export const PER_PAGE_OPTIONS = [6, 12, 24, 48]
export const MAX_CODES = 5

function defaultFilters() {
  return {
    page: 1,
    per_page: 12,
    search: '',
    categories: [],
    subjects: [],
    created_from: '',
    created_to: '',
    sort: 'created_at',
    order: 'desc',
  }
}

export function todayISO() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function withDateRange(filters) {
  return filters.created_from && !filters.created_to ? { ...filters, created_to: todayISO() } : filters
}

// Quita los filtros vacíos: CourseIndexRequest rechaza `search=''` (string
// vacío → null por ConvertEmptyStringsToNull) y arrays vacíos (min:1).
function toParams(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : value !== '' && value !== null && value !== undefined,
    ),
  )
}

// --- Filtros en la URL --------------------------------------------------
// La URL refleja los filtros (mismos nombres del backend) para que recargar,
// compartir el enlace o usar "Atrás" conserven la búsqueda. Al leerla, cada
// parámetro se valida con los límites de CourseIndexRequest y, si no es
// válido, se usa su valor por defecto. En la URL solo van filtros, nunca
// datos sensibles.
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const CODE_REGEX = /^[\w-]{1,50}$/

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function readInt(value, { min, max }) {
  const raw = firstValue(value)
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) return null
  const number = Number(raw)
  return number >= min && number <= max ? number : null
}

function readDate(value) {
  const raw = firstValue(value)
  if (typeof raw !== 'string' || !DATE_REGEX.test(raw)) return null
  const date = new Date(`${raw}T00:00:00Z`)
  // Descarta fechas imposibles (2026-02-31) comparando contra el texto.
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(raw) ? raw : null
}

function readOption(value, options) {
  const raw = firstValue(value)
  return options.includes(raw) ? raw : null
}

function readCodes(value) {
  const list = (Array.isArray(value) ? value : [value]).filter(
    (code) => typeof code === 'string' && CODE_REGEX.test(code),
  )
  return [...new Set(list)].slice(0, MAX_CODES)
}

export function filtersFromQuery(query = {}) {
  const defaults = defaultFilters()
  const search = firstValue(query.search)

  return withDateRange({
    page: readInt(query.page, { min: 1, max: Number.MAX_SAFE_INTEGER }) ?? defaults.page,
    per_page: readInt(query.per_page, { min: 1, max: 50 }) ?? defaults.per_page,
    search: typeof search === 'string' && search.trim().length <= 100 ? search.trim() : defaults.search,
    categories: readCodes(query.categories),
    subjects: readCodes(query.subjects),
    created_from: readDate(query.created_from) ?? defaults.created_from,
    created_to: readDate(query.created_to) ?? defaults.created_to,
    sort: readOption(query.sort, SORT_OPTIONS) ?? defaults.sort,
    order: readOption(query.order, ORDER_OPTIONS) ?? defaults.order,
  })
}

// Solo los filtros distintos del valor por defecto: sin filtros, la URL
// queda limpia (/app/explorer).
export function filtersToQuery(filters) {
  const defaults = defaultFilters()
  const query = {}
  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      if (value.length) query[key] = [...value]
    } else if (value !== defaults[key] && value !== '' && value !== null && value !== undefined) {
      query[key] = String(value)
    }
  }
  return query
}

// Compara dos queries de vue-router sin importar el orden de las claves ni
// si un valor único viene como string o como arreglo de un elemento.
export function isSameQuery(a = {}, b = {}) {
  const normalize = (query) =>
    JSON.stringify(
      Object.keys(query)
        .sort()
        .map((key) => [key, [].concat(query[key]).map(String)]),
    )
  return normalize(a) === normalize(b)
}

export const useCoursesStore = defineStore('courses', () => {
  const filters = ref(defaultFilters())
  // data / meta tal cual los manda el paginador de Laravel.
  const data = ref([])
  const meta = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchCourses() {
    loading.value = true
    error.value = null
    try {
      const response = await getCourses(toParams(filters.value))
      data.value = Array.isArray(response?.data) ? response.data : []
      meta.value = response?.meta ?? null
      return true
    } catch (err) {
      error.value = err
      data.value = []
      meta.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  // Cualquier cambio de filtro vuelve a la página 1.
  function setFilters(partial) {
    filters.value = withDateRange({ ...filters.value, ...partial, page: 1 })
    return fetchCourses()
  }

  function setPage(page) {
    filters.value = { ...filters.value, page }
    return fetchCourses()
  }

  function toggleFilterCode(key, code) {
    const current = filters.value[key]
    const next = current.includes(code) ? current.filter((value) => value !== code) : [...current, code]
    return setFilters({ [key]: next.slice(0, MAX_CODES) })
  }

  function resetFilters() {
    filters.value = defaultFilters()
    return fetchCourses()
  }

  // Carga los filtros desde la query de la URL (ya validados) y pide los
  // cursos.
  function clear() {
    filters.value = defaultFilters()
    data.value = []
    meta.value = null
    loading.value = false
    error.value = null
  }

  function applyQuery(query) {
    filters.value = filtersFromQuery(query)
    return fetchCourses()
  }

  return {
    filters,
    data,
    meta,
    loading,
    error,
    fetchCourses,
    setFilters,
    setPage,
    toggleFilterCode,
    resetFilters,
    applyQuery,
    clear,
  }
})
