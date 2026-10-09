import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'

import { getCourse } from '@/services/course.service'
import CourseDetailView from '@/views/app/CourseDetailView.vue'

const route = reactive({ params: { code: 'LARAVEL-101' } })

vi.mock('vue-router', () => ({
  useRoute: () => route,
}))

vi.mock('@/services/course.service', () => ({
  getCourse: vi.fn(),
}))

const global = {
  stubs: {
    RouterLink: {
      props: ['to'],
      template: '<a :href="to"><slot /></a>',
    },
  },
}

// Respuesta real (recortada) de GET /courses/{code}.
const COURSE_RESPONSE = {
  data: {
    code: 'LARAVEL-101',
    title: 'Laravel desde Cero',
    short_title: 'Laravel',
    description: 'Curso de Laravel',
    categories: [{ code: 'web', name: 'Web' }],
    subjects: [{ code: '8J4', name: 'Programación Web' }],
    image: 'http://localhost:81/storage/courses/images/laravel.png',
    lessons: [
      { id: 1, title: 'Introducción', short_title: 'Intro', order: 1 },
      { id: 2, title: 'Rutas', short_title: 'Rutas', order: 2 },
    ],
  },
}

describe('CourseDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    route.params.code = 'LARAVEL-101'
  })

  it('loads the course from GET /courses/{code} and lists its lessons', async () => {
    vi.mocked(getCourse).mockResolvedValue(COURSE_RESPONSE)
    const wrapper = mount(CourseDetailView, { global })
    await flushPromises()

    expect(getCourse).toHaveBeenCalledWith('LARAVEL-101')
    expect(wrapper.text()).toContain('Laravel desde Cero')
    expect(wrapper.text()).toContain('Programación Web')
    expect(wrapper.findAll('ol li')).toHaveLength(2)
  })

  it('links every lesson of the index to its lesson view', async () => {
    vi.mocked(getCourse).mockResolvedValue(COURSE_RESPONSE)
    const wrapper = mount(CourseDetailView, { global })
    await flushPromises()

    expect(wrapper.findAll('ol a').map((link) => link.attributes('href'))).toEqual([
      '/app/courses/LARAVEL-101/lessons/1',
      '/app/courses/LARAVEL-101/lessons/2',
    ])
  })

  it('hides the cover when the image fails to load, and retries for another course', async () => {
    vi.mocked(getCourse).mockResolvedValue(COURSE_RESPONSE)
    const wrapper = mount(CourseDetailView, { global })
    await flushPromises()
    expect(wrapper.find('img').exists()).toBe(true)

    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('Laravel desde Cero')

    route.params.code = 'GIT-101'
    await flushPromises()
    expect(getCourse).toHaveBeenLastCalledWith('GIT-101')
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('shows a not-found message on 404', async () => {
    vi.mocked(getCourse).mockRejectedValue({ status: 404, message: 'Not Found' })
    const wrapper = mount(CourseDetailView, { global })
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toContain('Este curso no existe o ya no está disponible.')
  })

  it('shows the backend message on other errors', async () => {
    vi.mocked(getCourse).mockRejectedValue({ status: 500, message: 'Server Error' })
    const wrapper = mount(CourseDetailView, { global })
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toContain('Server Error')
  })
})
