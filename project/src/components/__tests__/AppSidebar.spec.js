import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AppSidebar from '@/components/navigation/AppSidebar.vue'

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useRoute: () => ({ path: '/app' }),
  }
})

function mountSidebar(props = {}) {
  return mount(AppSidebar, {
    props,
    global: {
      stubs: {
        RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
      },
    },
  })
}

describe('AppSidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('replaces the Plataforma label with a collapse button', async () => {
    const wrapper = mountSidebar()
    const button = wrapper.get('button[aria-label="Colapsar menú"]')

    expect(wrapper.text()).not.toContain('Plataforma')
    expect(button.attributes('aria-expanded')).toBe('true')

    await button.trigger('click')

    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('shows the expand button and hides the labels when collapsed', () => {
    const wrapper = mountSidebar({ collapsed: true })
    const button = wrapper.get('button[aria-label="Expandir menú"]')

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.classes()).toContain('w-[76px]')
    expect(wrapper.text()).not.toContain('Inicio')
    expect(wrapper.text()).not.toContain('Progreso promedio')
  })

  it('puts the toggle on the right when expanded and in the icon column when collapsed', () => {
    expect(mountSidebar().get('button').classes()).toContain('self-end')
    expect(mountSidebar({ collapsed: true }).get('button').classes()).toContain('self-start')
  })

  it('names every icon with a tooltip only while collapsed', () => {
    const collapsedLinks = mountSidebar({ collapsed: true }).findAll('a')
    const expandedLinks = mountSidebar().findAll('a')

    expect(collapsedLinks.map((link) => link.attributes('title'))).toEqual([
      'Inicio',
      'Cursos',
      'Repositorio',
      'Crear contenido',
      'Mi perfil',
    ])
    expect(collapsedLinks.map((link) => link.attributes('aria-label'))).toEqual(
      collapsedLinks.map((link) => link.attributes('title')),
    )
    expect(expandedLinks.some((link) => link.attributes('title'))).toBe(false)
  })

  it('works as a drawer on mobile with a close button', async () => {
    const closed = mountSidebar({ mobile: true, open: false })

    expect(closed.classes()).toEqual(expect.arrayContaining(['fixed', 'w-[248px]', '-translate-x-full']))
    expect(closed.attributes('inert')).toBeDefined()

    const opened = mountSidebar({ mobile: true, open: true, collapsed: false })

    expect(opened.classes()).toContain('translate-x-0')
    expect(opened.attributes('inert')).toBeUndefined()
    expect(opened.find('button[aria-label="Colapsar menú"]').exists()).toBe(false)
    expect(opened.text()).toContain('Inicio')

    await opened.get('button[aria-label="Cerrar menú"]').trigger('click')
    expect(opened.emitted('close')).toHaveLength(1)
  })
})
