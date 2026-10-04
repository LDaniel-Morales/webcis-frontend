import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { getDashboard } from '@/services/auth.service'
import { useDashboardStore } from '@/stores/dashboard'

vi.mock('@/services/auth.service', () => ({
  getDashboard: vi.fn(),
}))

const REAL_PAYLOAD = {
  user: { username: 'student', type: 'Student' },
  medals: 1,
  courses: 1,
  progress: 40.5,
  recent_course_progress: 60,
  recent_courses: [
    {
      code: 'LARAVEL-101',
      title: 'Laravel desde Cero: El framework moderno de PHP',
      short_title: 'Laravel desde cero',
      description: 'Curso de Laravel',
      status: 1,
      joined_at: '2026-08-07 19:40:46',
      completed_at: null,
      last_accessed_at: '2026-08-19 17:40:46',
      icon: null,
    },
    {
      code: 'GIT-101',
      title: 'Docker desde Cero: Aprendiendo sobre contenerización',
      short_title: 'Docker desde cero',
      description: 'Curso de Docker',
      status: 2,
      joined_at: '2026-07-25 19:40:46',
      completed_at: '2026-08-16 19:40:46',
      last_accessed_at: '2026-08-17 19:40:46',
      icon: null,
    },
  ],
}

describe('dashboard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts empty', () => {
    const dashboard = useDashboardStore()

    expect(dashboard.medals).toBeNull()
    expect(dashboard.courses).toBeNull()
    expect(dashboard.progress).toBeNull()
    expect(dashboard.recent_course_progress).toBeNull()
    expect(dashboard.recent_courses).toEqual([])
    expect(dashboard.loaded).toBe(false)
    expect(dashboard.error).toBeNull()
    expect(dashboard.latestCourse).toBeNull()
  })

  it('keeps the GET /dashboard fields with backend names and ignores the nested user', () => {
    const dashboard = useDashboardStore()

    expect(dashboard.setDashboardData(REAL_PAYLOAD)).toBe(true)
    expect(dashboard.medals).toBe(1)
    expect(dashboard.courses).toBe(1)
    expect(dashboard.progress).toBe(40.5)
    expect(dashboard.recent_course_progress).toBe(60)
    expect(dashboard.recent_courses).toEqual(REAL_PAYLOAD.recent_courses)
    expect(dashboard.latestCourse).toEqual(REAL_PAYLOAD.recent_courses[0])
    expect(dashboard.loaded).toBe(true)
    expect(dashboard).not.toHaveProperty('user')
  })

  it('defaults missing fields to null and recent_courses to []', () => {
    const dashboard = useDashboardStore()

    dashboard.setDashboardData({})

    expect(dashboard.medals).toBeNull()
    expect(dashboard.courses).toBeNull()
    expect(dashboard.recent_courses).toEqual([])
    expect(dashboard.loaded).toBe(true)
  })

  it('clears the state when given a non-object payload', () => {
    const dashboard = useDashboardStore()
    dashboard.setDashboardData(REAL_PAYLOAD)

    expect(dashboard.setDashboardData(null)).toBe(false)
    expect(dashboard.loaded).toBe(false)
    expect(dashboard.recent_courses).toEqual([])
  })

  it('fetches its own data from GET /dashboard', async () => {
    vi.mocked(getDashboard).mockResolvedValue(REAL_PAYLOAD)
    const dashboard = useDashboardStore()

    await expect(dashboard.fetchDashboard()).resolves.toBe(true)
    expect(getDashboard).toHaveBeenCalledOnce()
    expect(dashboard.courses).toBe(1)
    expect(dashboard.loading).toBe(false)
    expect(dashboard.error).toBeNull()
  })

  it('keeps the backend error without throwing (BUG-01: 404 without in-progress courses)', async () => {
    const error = { status: 404, message: 'No query results for model [App\\Models\\Course].' }
    vi.mocked(getDashboard).mockRejectedValue(error)
    const dashboard = useDashboardStore()

    await expect(dashboard.fetchDashboard()).resolves.toBe(false)
    expect(dashboard.error).toEqual(error)
    expect(dashboard.loaded).toBe(false)
    expect(dashboard.loading).toBe(false)
  })

  it('clears back to the empty state, including the error', async () => {
    vi.mocked(getDashboard).mockRejectedValue({ status: 404 })
    const dashboard = useDashboardStore()
    dashboard.setDashboardData(REAL_PAYLOAD)
    await dashboard.fetchDashboard()

    dashboard.clear()

    expect(dashboard.courses).toBeNull()
    expect(dashboard.recent_courses).toEqual([])
    expect(dashboard.loaded).toBe(false)
    expect(dashboard.error).toBeNull()
  })
})
