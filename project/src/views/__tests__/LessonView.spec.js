import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'

import { getCourse, getLesson, getLessons } from '@/services/course.service'
import LessonView from '@/views/app/LessonView.vue'

enableAutoUnmount(afterEach)

const route = reactive({ params: { code: 'LARAVEL-101', id: '1' } })

vi.mock('vue-router', () => ({
  useRoute: () => route,
}))

vi.mock('@/services/course.service', () => ({
  getCourse: vi.fn(),
  getLessons: vi.fn(),
  getLesson: vi.fn(),
}))

const global = {
  stubs: {
    RouterLink: {
      props: ['to'],
      template: '<a :href="to"><slot /></a>',
    },
  },
}

const LESSONS = [
  { id: 3, title: 'Primer proyecto', short_title: 'Primer proyecto', order: 3 },
  { id: 1, title: 'Introducción', short_title: 'Introducción', order: 1 },
  { id: 2, title: 'Instalación del entorno', short_title: 'Instalación', order: 2 },
]

function lessonResponse(id, content = null) {
  const lesson = LESSONS.find((item) => item.id === Number(id))
  return { lesson: { id: null, title: lesson.title, short_title: lesson.short_title, order: lesson.order, content } }
}

async function mountAt(id) {
  route.params.id = String(id)
  const wrapper = mount(LessonView, { global })
  await flushPromises()
  return wrapper
}

const link = (wrapper, text) => wrapper.findAll('a').find((a) => a.text() === text)

describe('LessonView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    route.params.code = 'LARAVEL-101'
    vi.mocked(getCourse).mockResolvedValue({ data: { code: 'LARAVEL-101', title: 'Laravel desde Cero' } })
    vi.mocked(getLessons).mockResolvedValue({ lessons: LESSONS })
    vi.mocked(getLesson).mockImplementation((code, id) => Promise.resolve(lessonResponse(id)))
  })

  it('loads the course, its lessons and the lesson, with a back link to the course', async () => {
    const wrapper = await mountAt(1)

    expect(getCourse).toHaveBeenCalledWith('LARAVEL-101')
    expect(getLessons).toHaveBeenCalledWith('LARAVEL-101')
    expect(getLesson).toHaveBeenCalledWith('LARAVEL-101', '1')
    expect(link(wrapper, 'Laravel desde Cero').attributes('href')).toBe('/app/courses/LARAVEL-101')
    expect(wrapper.text()).toContain('Lección 1')
    expect(wrapper.get('h1').text()).toBe('Introducción')
  })

  it('shows course progress and "mark as completed" as not available yet', async () => {
    const wrapper = await mountAt(1)
    const complete = wrapper.findAll('button').find((button) => button.text() === 'Marcar como completada')

    expect(wrapper.text()).toContain('Progreso del curso')
    expect(wrapper.text()).toContain('Aún no disponible en el servidor')
    expect(complete.attributes('disabled')).toBeDefined()
    expect(complete.attributes('title')).toBe('Aún no disponible en el servidor')
  })

  it('shows the empty content notice when content is null', async () => {
    const wrapper = await mountAt(1)

    expect(wrapper.text()).toContain('Contenido aún no disponible en el servidor')
  })

  it('shows content only as text, including non-string values', async () => {
    vi.mocked(getLesson).mockResolvedValueOnce(lessonResponse(1, 'Primer párrafo\nSegundo párrafo'))
    let wrapper = await mountAt(1)
    expect(wrapper.find('p.whitespace-pre-wrap').text()).toBe('Primer párrafo\nSegundo párrafo')

    vi.mocked(getLesson).mockResolvedValueOnce(lessonResponse(1, { blocks: [{ type: 'paragraph' }] }))
    wrapper = await mountAt(1)
    expect(wrapper.find('p.whitespace-pre-wrap').text()).toContain('"type": "paragraph"')
  })

  it('navigates by lesson order: no previous on the first, both in the middle, no next on the last', async () => {
    let wrapper = await mountAt(1)
    expect(link(wrapper, '← Anterior')).toBeUndefined()
    expect(link(wrapper, 'Siguiente →').attributes('href')).toBe('/app/courses/LARAVEL-101/lessons/2')

    wrapper = await mountAt(2)
    expect(link(wrapper, '← Anterior').attributes('href')).toBe('/app/courses/LARAVEL-101/lessons/1')
    expect(link(wrapper, 'Siguiente →').attributes('href')).toBe('/app/courses/LARAVEL-101/lessons/3')

    wrapper = await mountAt(3)
    expect(link(wrapper, '← Anterior').attributes('href')).toBe('/app/courses/LARAVEL-101/lessons/2')
    expect(link(wrapper, 'Siguiente →')).toBeUndefined()
  })

  it('only refetches the lesson when moving to another lesson of the same course', async () => {
    await mountAt(1)

    route.params.id = '2'
    await flushPromises()

    expect(getCourse).toHaveBeenCalledOnce()
    expect(getLessons).toHaveBeenCalledOnce()
    expect(getLesson).toHaveBeenLastCalledWith('LARAVEL-101', '2')
  })

  it('shows a lesson 404 with the backend status and message', async () => {
    vi.mocked(getLesson).mockRejectedValue({ status: 404, message: 'No query results for model [App\\Models\\Lesson].' })
    const wrapper = await mountAt(99)
    const alert = wrapper.get('[role="alert"]').text()

    expect(alert).toContain('Esta lección no existe o ya no está disponible.')
    expect(alert).toContain('Error 404')
  })

  it('shows a course 404 when the course does not exist', async () => {
    vi.mocked(getCourse).mockRejectedValue({ status: 404, message: 'No query results for model [App\\Models\\Course].' })
    const wrapper = await mountAt(1)

    expect(wrapper.get('[role="alert"]').text()).toContain('Este curso no existe o ya no está disponible.')
    expect(getLesson).not.toHaveBeenCalled()
  })

  it('shows other backend errors with status and message', async () => {
    vi.mocked(getLesson).mockRejectedValue({ status: 500, message: 'Server Error' })
    const wrapper = await mountAt(1)
    const alert = wrapper.get('[role="alert"]').text()

    expect(alert).toContain('No se pudo cargar la lección')
    expect(alert).toContain('Error 500 · Server Error')
  })
})
