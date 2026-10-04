import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getDashboard } from '@/services/auth.service'

export const useDashboardStore = defineStore('dashboard', () => {
  const medals = ref(null)
  const courses = ref(null)
  const progress = ref(null)
  const recent_course_progress = ref(null)
  const recent_courses = ref([])
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref(null)

  const latestCourse = computed(() => recent_courses.value[0] ?? null)

  function setDashboardData(payload) {
    if (!payload || typeof payload !== 'object') {
      clear()
      return false
    }

    medals.value = payload.medals ?? null
    courses.value = payload.courses ?? null
    progress.value = payload.progress ?? null
    recent_course_progress.value = payload.recent_course_progress ?? null
    recent_courses.value = Array.isArray(payload.recent_courses) ? payload.recent_courses : []
    loaded.value = true
    return true
  }

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
    courses.value = null
    progress.value = null
    recent_course_progress.value = null
    recent_courses.value = []
    loaded.value = false
    error.value = null
  }

  return {
    medals,
    courses,
    progress,
    recent_course_progress,
    recent_courses,
    loaded,
    loading,
    error,
    latestCourse,
    setDashboardData,
    fetchDashboard,
    clear,
  }
})
