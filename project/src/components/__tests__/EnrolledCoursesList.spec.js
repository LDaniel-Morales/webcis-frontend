import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import EnrolledCoursesList from '@/components/app/dashboard/EnrolledCoursesList.vue'

const global = {
  stubs: {
    RouterLink: {
      props: ['to'],
      template: '<a :href="to"><slot /></a>',
    },
  },
}

const COURSES = [
  {
    code: 'LARAVEL-101',
    title: 'Laravel desde Cero: El framework moderno de PHP',
    short_title: 'Laravel desde cero',
    status: 1,
    last_accessed_at: '2026-08-19 17:40:46',
    icon: null,
  },
  {
    code: 'GIT-101',
    title: 'Docker desde Cero: Aprendiendo sobre contenerización',
    short_title: 'Docker desde cero',
    status: 2,
    last_accessed_at: null,
    icon: null,
  },
]

describe('EnrolledCoursesList', () => {
  it('lists the recent courses with their last access', () => {
    const wrapper = mount(EnrolledCoursesList, { props: { courses: COURSES }, global })

    expect(wrapper.find('h2').text()).toBe('Cursos recientes')
    expect(wrapper.text()).toContain('Laravel desde Cero: El framework moderno de PHP')
    expect(wrapper.text()).toContain('Docker desde cero')
    expect(wrapper.text()).toMatch(/Último acceso: 19 ago\.? 2026/)
    expect(wrapper.text().match(/Último acceso/g)).toHaveLength(1)
  })

  it('links "Content" and "Continue" to the course detail', () => {
    const wrapper = mount(EnrolledCoursesList, { props: { courses: COURSES }, global })
    const links = wrapper.findAll('a').map((a) => [a.text(), a.attributes('href')])

    expect(links).toEqual([
      ['Contenido', '/app/courses/LARAVEL-101'],
      ['Continuar', '/app/courses/LARAVEL-101'],
      ['Contenido', '/app/courses/GIT-101'],
      ['Continuar', '/app/courses/GIT-101'],
    ])
  })

  it('shows the empty state when there are no recent courses', () => {
    const wrapper = mount(EnrolledCoursesList, { global })

    expect(wrapper.text()).toContain('Aún no te has inscrito a ningún curso')
    expect(wrapper.find('a').attributes('href')).toBe('/app/explorer')
  })
})
