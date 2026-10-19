import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AppUserMenu from '@/components/navigation/AppUserMenu.vue'
import { useAuthStore } from '@/stores/auth'

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
  }
})

async function openMenu(type) {
  useAuthStore().setUser({ username: 'test', name: 'Test', type })
  const wrapper = mount(AppUserMenu, {
    global: {
      stubs: { RouterLink: { props: ['to'], template: '<a :href="to" @click="$emit(\'click\')"><slot /></a>' } },
    },
  })
  await wrapper.get('button').trigger('click')
  return wrapper
}

function links(wrapper) {
  return wrapper.findAll('a').map((link) => [link.text(), link.attributes('href'), link.classes().includes('md:hidden')])
}

describe('AppUserMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds Crear contenido to the menu only on mobile', async () => {
    const wrapper = await openMenu('Student')

    expect(links(wrapper)).toEqual([
      ['Mi perfil', '/app/profile', false],
      ['Crear contenido', '/app/repository/new', true],
    ])
    expect(wrapper.text()).toContain('Configuración')
    expect(wrapper.text()).toContain('Cerrar sesión')
  })

  it('adds Administración on mobile for admins', async () => {
    const wrapper = await openMenu('Admin')

    expect(links(wrapper)).toEqual([
      ['Mi perfil', '/app/profile', false],
      ['Crear contenido', '/app/repository/new', true],
      ['Administración', '/admin', true],
    ])
  })

  it('closes the menu after choosing a link', async () => {
    const wrapper = await openMenu('Student')

    await wrapper.get('a[href="/app/repository/new"]').trigger('click')

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
  })
})
