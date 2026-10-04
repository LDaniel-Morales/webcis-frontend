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
// - order: asc | desc. Vacío = el backend usa desc.
//
// `order` se envía tal cual aunque hoy responde 500 (BUG-04 en
// md/notas/bugsBack.md): el error se muestra en la vista a propósito para
// que sea evidente.
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
    order: '',
  }
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
    filters.value = { ...filters.value, ...partial, page: 1 }
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
  }
})
