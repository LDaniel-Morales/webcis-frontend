import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiGet } from '@/services/api.js'
import { getCourse, getCourses } from '@/services/course.service.js'

vi.mock('@/services/api.js', () => ({
  apiGet: vi.fn(),
}))

describe('course service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists courses from GET /courses passing the params as-is', async () => {
    const params = { page: 2, per_page: 12, search: 'laravel', categories: ['web'], sort: 'title', order: 'asc' }

    await getCourses(params)

    expect(apiGet).toHaveBeenCalledWith('/courses', { params })
  })

  it('gets one course from GET /courses/{code}, encoding the code', async () => {
    await getCourse('LARAVEL-101')
    await getCourse('A B/C')

    expect(apiGet).toHaveBeenCalledWith('/courses/LARAVEL-101')
    expect(apiGet).toHaveBeenCalledWith('/courses/A%20B%2FC')
  })
})
