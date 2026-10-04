import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import CourseCard from '@/components/app/courses/CourseCard.vue'

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
  title: 'Laravel desde Cero',
  short_title: 'Laravel',
  description: 'Curso de Laravel',
  categories: [{ code: 'web', name: 'Web' }],
  subjects: [{ code: '8J4', name: 'Programación Web' }],
  status: 3,
  icon: 'http://localhost:81/storage/courses/icons/laravel.png',
}

describe('CourseCard', () => {
  it('renders the course with links to its detail', () => {
    const wrapper = mount(CourseCard, { props: { course: COURSE }, global })

    expect(wrapper.text()).toContain('LARAVEL-101')
    expect(wrapper.text()).toContain('Laravel desde Cero')
    expect(wrapper.find('a[href="/app/courses/LARAVEL-101"]').exists()).toBe(true)
  })

  it('shows the default placeholder when the icon fails to load, and retries on a new URL', async () => {
    const wrapper = mount(CourseCard, { props: { course: COURSE }, global })
    expect(wrapper.find('img').exists()).toBe(true)

    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('svg').exists()).toBe(true)

    await wrapper.setProps({ course: { ...COURSE, icon: 'http://localhost:81/storage/courses/icons/nuevo.png' } })
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('shows the placeholder when the course has no icon', () => {
    const wrapper = mount(CourseCard, { props: { course: { ...COURSE, icon: null } }, global })

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('emits the category/subject to filter by and highlights active codes', async () => {
    const wrapper = mount(CourseCard, { props: { course: COURSE, activeCategories: ['web'] }, global })
    const [category, subject] = wrapper.findAll('button')

    expect(category.classes()).toContain('bg-primario')
    await category.trigger('click')
    await subject.trigger('click')

    expect(wrapper.emitted('toggle-category')[0]).toEqual([COURSE.categories[0]])
    expect(wrapper.emitted('toggle-subject')[0]).toEqual([COURSE.subjects[0]])
  })
})
