import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getDashboard } from '@/services/auth.service'

// GET /dashboard (ver fetchDashboard) devuelve, junto con `user`:
// { medals: number, progress: number (0-100, promedio global de todos los
// cursos activos, no por curso), recent_courses: [{ token, title,
// short_title, icon, last_accessed_at }] } — máx. 5, solo cursos con
// last_accessed_at no nulo (confirmado en EnrollmentService del backend).
// No es la lista completa de cursos inscritos.
//
// `icon` se pasa tal cual a los componentes (ContinueCourseCard.vue,
// EnrolledCoursesList.vue usan `:src="course.icon"` directo) asumiendo que
// cuando el backend mande un valor no nulo será una URL completa y
// utilizable. Decisión: no se construye una URL desde un path relativo aquí.
// No hay todavía un ejemplo real con valor no nulo para confirmar el
// formato — revisar esto en cuanto aparezca uno (ver dashboard_api_contract
// en memoria).
function normalizeCourse(course) {
  if (!course || typeof course !== 'object') return null

  return {
    token: course.token ?? null,
    title: course.title ?? null,
    shortTitle: course.short_title ?? null,
    icon: course.icon ?? null,
    lastAccessedAt: course.last_accessed_at ?? null,
  }
}

export function normalizeDashboardData(payload) {
  if (!payload || typeof payload !== 'object') return null

  return {
    medals: payload.medals ?? null,
    progress: payload.progress ?? null,
    recentCourses: Array.isArray(payload.recent_courses)
      ? payload.recent_courses.map(normalizeCourse).filter(Boolean)
      : [],
  }
}

export const useDashboardStore = defineStore('dashboard', () => {
  const medals = ref(null)
  const progress = ref(null)
  const recentCourses = ref([])
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // Curso más reciente entre los inscritos con actividad; base para
  // "Continúa donde lo dejaste".
  const latestCourse = computed(() => recentCourses.value[0] ?? null)

  function setDashboardData(payload) {
    const normalized = normalizeDashboardData(payload)
    if (!normalized) {
      clear()
      return false
    }

    medals.value = normalized.medals
    progress.value = normalized.progress
    recentCourses.value = normalized.recentCourses
    loaded.value = true
    return true
  }

  // La sesión se verifica con GET /me (stores/auth.js), así que el dashboard
  // pide sus propios datos. Ojo: por un bug del backend
  // (EnrollmentService::courseProgress() usa firstOrFail()), un usuario sin
  // ningún curso InProgress recibe 404 aquí; solo afecta a esta vista.
  async function fetchDashboard() {
    loading.value = true
    error.value = null
    try {
      return setDashboardData(await getDashboard())
    } catch (err) {
      error.value = err
      return false
    } finally {
      loading.value = false
    }
  }

  function clear() {
    medals.value = null
    progress.value = null
    recentCourses.value = []
    loaded.value = false
    error.value = null
  }

  return {
    medals,
    progress,
    recentCourses,
    loaded,
    loading,
    error,
    latestCourse,
    setDashboardData,
    fetchDashboard,
    clear,
  }
})
