import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AppBottomNav from '@/components/navigation/AppBottomNav.vue'

const route = { path: '/app' }

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useRoute: () => route,
  }
})

function mountNav(path) {
  route.path = path
  return mount(AppBottomNav, {
    global: {
      stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } },
    },
  })
}

function activeLabel(wrapper) {
  return wrapper.findAll('a[aria-current="page"]').map((link) => link.text())
}

describe('AppBottomNav', () => {
  beforeEach(() => {
    route.path = '/app'
  })

  it('shows Inicio, Cursos, Repo and Perfil only on mobile', () => {
    const wrapper = mountNav('/app')

    expect(wrapper.classes()).toContain('md:hidden')
    expect(wrapper.findAll('a').map((link) => [link.text(), link.attributes('href')])).toEqual([
      ['Inicio', '/app'],
      ['Cursos', '/app/explorer'],
      ['Repo', '/app/repository'],
      ['Perfil', '/app/profile'],
    ])
  })

  it.each([
    ['/app', ['Inicio']],
    ['/app/explorer', ['Cursos']],
    ['/app/courses/LARAVEL-101/lessons/1', ['Cursos']],
    ['/app/repository/demo-1', ['Repo']],
    ['/app/repository/new', []],
    ['/app/profile', ['Perfil']],
  ])('marks the active tab on %s', (path, expected) => {
    const wrapper = mountNav(path)

    expect(activeLabel(wrapper)).toEqual(expected)
    expect(wrapper.findAll('a.text-acento').map((link) => link.text())).toEqual(expected)
  })
})
