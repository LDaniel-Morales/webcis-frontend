import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ContinueCourseCard from '@/components/app/dashboard/ContinueCourseCard.vue'

const global = {
  stubs: {
    RouterLink: {
      props: ['to'],
      template: '<a :href="to"><slot /></a>',
    },
  },
}

const COURSE = {
  code: 'LARAVEL-101',
  title: 'Laravel desde Cero: El framework moderno de PHP',
  short_title: 'Laravel desde cero',
  status: 1,
  last_accessed_at: '2026-08-19 17:40:46',
  icon: null,
}

describe('ContinueCourseCard', () => {
  it('shows the in-progress course with recent_course_progress and links to its detail', () => {
    const wrapper = mount(ContinueCourseCard, { props: { course: COURSE, recentCourseProgress: 45.5 }, global })

    expect(wrapper.text()).toContain('Laravel desde Cero: El framework moderno de PHP')
    expect(wrapper.text()).toContain('Laravel desde cero')
    expect(wrapper.text()).toContain('45.5% completado')
    expect(wrapper.find('a').attributes('href')).toBe('/app/courses/LARAVEL-101')
    expect(wrapper.text()).toContain('Continuar curso')
  })

  it('shows 100% when the latest course is completed', () => {
    const wrapper = mount(ContinueCourseCard, {
      props: { course: { ...COURSE, status: 2 }, recentCourseProgress: 10 },
      global,
    })

    expect(wrapper.text()).toContain('100% completado')
  })

  it('shows 0% when there is no recent_course_progress', () => {
    const wrapper = mount(ContinueCourseCard, { props: { course: COURSE }, global })

    expect(wrapper.text()).toContain('0% completado')
  })

  it('invites to explore courses when there is no recent course', () => {
    const wrapper = mount(ContinueCourseCard, { global })

    expect(wrapper.text()).toContain('Aún no tienes un curso en progreso.')
    expect(wrapper.find('a').attributes('href')).toBe('/app/explorer')
    expect(wrapper.text()).toContain('Explorar cursos')
  })
})
