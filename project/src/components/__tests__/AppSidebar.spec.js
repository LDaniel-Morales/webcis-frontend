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
})
