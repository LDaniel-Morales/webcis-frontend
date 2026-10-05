import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { reactive } from 'vue'

import { deleteMaterial, getMaterial } from '@/services/material.service'
import MaterialDetailView from '@/views/app/MaterialDetailView.vue'

enableAutoUnmount(afterEach)

const route = reactive({ params: { id: '1' } })
const push = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}))

vi.mock('@/services/material.service', () => ({
  getMaterial: vi.fn(),
  getMaterials: vi.fn(),
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  deleteMaterial: vi.fn(),
}))

const global = {
  stubs: {
    RouterLink: {
      props: ['to'],
      template: '<a :href="to"><slot /></a>',
    },
  },
}

const MATERIAL = {
  mat_serial: 1,
  mat_title: 'Manual de POO',
  mat_publication_date: '2026-10-04 00:00:00',
  mat_code: 'MAN-POO',
  mat_description: 'Manual de programación orientada a objetos',
  fk_materials_users: '9f1c2d3e-0000-4000-8000-000000000001',
}

describe('MaterialDetailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    route.params.id = '1'
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('shows the material with its backend fields and the author id', async () => {
    vi.mocked(getMaterial).mockResolvedValue(MATERIAL)
    const wrapper = mount(MaterialDetailView, { global })
    await flushPromises()

    expect(getMaterial).toHaveBeenCalledWith('1')
    expect(wrapper.text()).toContain('MAN-POO')
    expect(wrapper.text()).toContain('Manual de POO')
    expect(wrapper.text()).toContain('Manual de programación orientada a objetos')
    expect(wrapper.text()).toContain('Por 9f1c2d3e-0000-4000-8000-000000000001')
    expect(wrapper.find('a[href="/app/repository/1/edit"]').exists()).toBe(true)
  })

  it('loads a sample material from the mock file without calling the backend', async () => {
    route.params.id = 'demo-1'
    const wrapper = mount(MaterialDetailView, { global })
    await flushPromises()

    expect(getMaterial).not.toHaveBeenCalled()
    expect(wrapper.get('[role="status"]').text()).toContain('Datos de ejemplo')
    expect(wrapper.text()).toContain('Manual de POO en C++')
    expect(wrapper.text()).toContain('Por Prof. C. Méndez')
    expect(wrapper.text()).toContain('Publicado el 12 mar 2026')
    expect(wrapper.text()).toContain('1,248')
    expect(wrapper.text()).toContain('Manual_POO_Cpp.pdf')
    expect(wrapper.findAll('button[title="Aún no disponible en el servidor"]')).toHaveLength(5)
    expect(wrapper.findAll('button[title="Aún no disponible en el servidor"]').every((button) => button.attributes('disabled') !== undefined)).toBe(true)
    expect(wrapper.find('a[href="/app/repository/demo-1/edit"]').exists()).toBe(false)
  })

  it('shows 404 for an unknown sample material without calling the backend', async () => {
    route.params.id = 'demo-99'
    const wrapper = mount(MaterialDetailView, { global })
    await flushPromises()

    expect(getMaterial).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toContain('Error 404')
  })

  it('shows that files are not available yet for a real material', async () => {
    vi.mocked(getMaterial).mockResolvedValue(MATERIAL)
    const wrapper = mount(MaterialDetailView, { global })
    await flushPromises()

    expect(wrapper.text()).toContain('Archivos')
    expect(wrapper.text()).toContain('Aún no disponible en el servidor')
    expect(wrapper.text()).not.toContain('Descargar todo')
  })

  it('shows a not-found message on 404', async () => {
    vi.mocked(getMaterial).mockRejectedValue({ status: 404, message: 'No query results' })
    const wrapper = mount(MaterialDetailView, { global })
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Este material no existe o ya no está disponible.')
  })

  it('deletes after confirmation and goes back to the list', async () => {
    vi.mocked(getMaterial).mockResolvedValue(MATERIAL)
    vi.mocked(deleteMaterial).mockResolvedValue({ message: 'Deleted' })
    const wrapper = mount(MaterialDetailView, { global })
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === 'Borrar').trigger('click')
    await flushPromises()

    expect(window.confirm).toHaveBeenCalledOnce()
    expect(deleteMaterial).toHaveBeenCalledWith('1')
    expect(push).toHaveBeenCalledWith('/app/repository')
  })

  it('does not delete when the confirmation is cancelled', async () => {
    window.confirm.mockReturnValue(false)
    vi.mocked(getMaterial).mockResolvedValue(MATERIAL)
    const wrapper = mount(MaterialDetailView, { global })
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === 'Borrar').trigger('click')
    await flushPromises()

    expect(deleteMaterial).not.toHaveBeenCalled()
  })

  it('shows the backend error when delete fails', async () => {
    vi.mocked(getMaterial).mockResolvedValue(MATERIAL)
    vi.mocked(deleteMaterial).mockRejectedValue({ status: 500, message: 'Server Error' })
    const wrapper = mount(MaterialDetailView, { global })
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === 'Borrar').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Error 500')
    expect(wrapper.get('[role="alert"]').text()).toContain('Server Error')
    expect(push).not.toHaveBeenCalled()
  })
})
