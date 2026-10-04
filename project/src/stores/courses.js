import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getCourses } from '@/services/course.service'

// Filtros de GET /courses con los nombres de CourseIndexRequest.
//
// `order` no se envía a propósito: CourseService::paginate() hace
// `$order->value` sobre el string validado, así que mandar order=asc|desc
// responde 500 (bug del backend). Sin `order` el backend usa desc por
// defecto. Cuando lo corrijan, basta con agregar `order` a los filtros.
function defaultFilters() {
  return {
    page: 1,
    per_page: 12,
    search: '',
    categories: [],
    subjects: [],
    sort: 'created_at',
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
    // categories / subjects: máx. 5 en CourseIndexRequest.
    return setFilters({ [key]: next.slice(0, 5) })
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
