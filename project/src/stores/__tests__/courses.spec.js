import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { getCourses } from '@/services/course.service'
import { filtersFromQuery, filtersToQuery, isSameQuery, todayISO, useCoursesStore } from '@/stores/courses'

vi.mock('@/services/course.service', () => ({
  getCourses: vi.fn(),
}))

const DEFAULT_FILTERS = {
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

// Respuesta real (recortada) del paginador de Laravel en GET /courses.
const PAGE_RESPONSE = {
  data: [{ code: 'LARAVEL-101', title: 'Laravel desde Cero', categories: [{ code: 'web', name: 'Web' }], subjects: [] }],
  links: {},
  meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
}

describe('courses store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(getCourses).mockResolvedValue(PAGE_RESPONSE)
  })

  it('starts with the default filters', () => {
    expect(useCoursesStore().filters).toEqual(DEFAULT_FILTERS)
  })

  it('omits empty filters from the request and keeps data/meta as sent by Laravel', async () => {
    const courses = useCoursesStore()

    await expect(courses.fetchCourses()).resolves.toBe(true)

    expect(getCourses).toHaveBeenCalledWith({ page: 1, per_page: 12, sort: 'created_at', order: 'desc' })
    expect(courses.data).toEqual(PAGE_RESPONSE.data)
    expect(courses.meta).toEqual(PAGE_RESPONSE.meta)
  })

  it('sends every CourseIndexRequest filter with backend names, including order', async () => {
    const courses = useCoursesStore()

    await courses.setFilters({
      search: 'laravel',
      categories: ['web'],
      subjects: ['8J4'],
      created_from: '2026-01-01',
      created_to: '2026-12-31',
      sort: 'title',
      order: 'asc',
      per_page: 24,
    })

    expect(getCourses).toHaveBeenLastCalledWith({
      page: 1,
      per_page: 24,
      search: 'laravel',
      categories: ['web'],
      subjects: ['8J4'],
      created_from: '2026-01-01',
      created_to: '2026-12-31',
      sort: 'title',
      order: 'asc',
    })
  })

  it('goes back to page 1 on any filter change and keeps filters when paging', async () => {
    const courses = useCoursesStore()
    await courses.setPage(3)
    expect(courses.filters.page).toBe(3)

    await courses.setFilters({ search: 'docker' })
    expect(courses.filters.page).toBe(1)

    await courses.setPage(2)
    expect(courses.filters).toMatchObject({ page: 2, search: 'docker' })
  })

  it('toggles category/subject codes with a max of 5', async () => {
    const courses = useCoursesStore()

    for (const code of ['a', 'b', 'c', 'd', 'e', 'f']) await courses.toggleFilterCode('categories', code)
    expect(courses.filters.categories).toEqual(['a', 'b', 'c', 'd', 'e'])

    await courses.toggleFilterCode('categories', 'c')
    expect(courses.filters.categories).toEqual(['a', 'b', 'd', 'e'])
  })

  it('resets every filter', async () => {
    const courses = useCoursesStore()
    await courses.setFilters({ search: 'x', order: 'desc', categories: ['web'] })

    await courses.resetFilters()

    expect(courses.filters).toEqual(DEFAULT_FILTERS)
  })

  it.each([
    ['500 (BUG-04, order)', { status: 500, message: 'Attempt to read property "value" on string' }],
    ['422 (validation)', { status: 422, message: 'Invalid', data: { errors: { created_from: ['must be before'] } } }],
  ])('keeps a backend %s error without throwing and clears the list', async (_, error) => {
    const courses = useCoursesStore()
    await courses.fetchCourses()
    vi.mocked(getCourses).mockRejectedValue(error)

    await expect(courses.setFilters({ order: 'asc' })).resolves.toBe(false)

    expect(courses.error).toEqual(error)
    expect(courses.data).toEqual([])
    expect(courses.meta).toBeNull()
    expect(courses.loading).toBe(false)
  })

  it('applies validated filters from a URL query and fetches', async () => {
    const courses = useCoursesStore()

    await courses.applyQuery({ search: 'laravel', categories: 'web', page: '2' })

    expect(courses.filters).toMatchObject({ search: 'laravel', categories: ['web'], page: 2 })
    expect(getCourses).toHaveBeenCalledWith({
      page: 2,
      per_page: 12,
      search: 'laravel',
      categories: ['web'],
      sort: 'created_at',
      order: 'desc',
    })
  })
})

describe('filtersFromQuery', () => {
  it('reads every valid param', () => {
    expect(
      filtersFromQuery({
        page: '3',
        per_page: '30',
        search: '  laravel  ',
        categories: ['web', 'frame'],
        subjects: '8J4',
        created_from: '2026-01-01',
        created_to: '2026-12-31',
        sort: 'title',
        order: 'desc',
      }),
    ).toEqual({
      page: 3,
      per_page: 30,
      search: 'laravel',
      categories: ['web', 'frame'],
      subjects: ['8J4'],
      created_from: '2026-01-01',
      created_to: '2026-12-31',
      sort: 'title',
      order: 'desc',
    })
  })

  it('falls back to defaults for invalid or tampered params and drops unknown ones', () => {
    expect(
      filtersFromQuery({
        page: '-5',
        per_page: '99999',
        search: 'a'.repeat(101),
        categories: ['<script>', 'web', 'web'],
        created_from: '2026-02-31',
        created_to: 'mañana',
        sort: 'hack',
        order: 'x',
        token: 'secreto',
      }),
    ).toEqual({ ...DEFAULT_FILTERS, categories: ['web'] })
  })

  it('keeps at most 5 category/subject codes', () => {
    expect(filtersFromQuery({ subjects: ['a', 'b', 'c', 'd', 'e', 'f'] }).subjects).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('returns the defaults for an empty query', () => {
    expect(filtersFromQuery()).toEqual(DEFAULT_FILTERS)
  })
})

describe('filtersToQuery / isSameQuery', () => {
  it('only writes non-default values, so a clean catalog has a clean URL', () => {
    expect(filtersToQuery(DEFAULT_FILTERS)).toEqual({})
    expect(filtersToQuery({ ...DEFAULT_FILTERS, search: 'laravel', categories: ['web'], page: 2, order: 'asc' })).toEqual({
      search: 'laravel',
      categories: ['web'],
      page: '2',
      order: 'asc',
    })
  })

  it('round-trips through the URL', () => {
    const filters = { ...DEFAULT_FILTERS, search: 'docker', subjects: ['8J4'], per_page: 24, sort: 'title' }

    expect(filtersFromQuery(filtersToQuery(filters))).toEqual(filters)
  })

  it('compares queries ignoring key order and single value vs one-item array', () => {
    expect(isSameQuery({ a: '1', categories: ['web'] }, { categories: 'web', a: '1' })).toBe(true)
    expect(isSameQuery({ search: 'a' }, { search: 'b' })).toBe(false)
    expect(isSameQuery({}, { page: '2' })).toBe(false)
  })
})

describe('created_to defaults to today', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(getCourses).mockResolvedValue(PAGE_RESPONSE)
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 9, 23, 30))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the local date as YYYY-MM-DD', () => {
    expect(todayISO()).toBe('2026-10-09')
  })

  it('fills created_to with today when only created_from is set', async () => {
    const courses = useCoursesStore()

    await courses.setFilters({ created_from: '2026-10-08' })

    expect(courses.filters).toMatchObject({ created_from: '2026-10-08', created_to: '2026-10-09' })
    expect(getCourses).toHaveBeenLastCalledWith(expect.objectContaining({ created_from: '2026-10-08', created_to: '2026-10-09' }))
  })

  it('refills created_to with today when it is cleared while created_from is set', async () => {
    const courses = useCoursesStore()
    await courses.setFilters({ created_from: '2026-10-01', created_to: '2026-10-05' })

    await courses.setFilters({ created_to: '' })

    expect(courses.filters.created_to).toBe('2026-10-09')
  })

  it('keeps an explicit created_to and leaves both empty when created_from is empty', async () => {
    const courses = useCoursesStore()

    await courses.setFilters({ created_from: '2026-10-01', created_to: '2026-10-05' })
    expect(courses.filters.created_to).toBe('2026-10-05')

    await courses.setFilters({ created_from: '', created_to: '' })
    expect(courses.filters).toMatchObject({ created_from: '', created_to: '' })
  })

  it('fills created_to with today for a URL with only created_from', () => {
    expect(filtersFromQuery({ created_from: '2026-10-01' })).toMatchObject({ created_from: '2026-10-01', created_to: '2026-10-09' })
  })
})

