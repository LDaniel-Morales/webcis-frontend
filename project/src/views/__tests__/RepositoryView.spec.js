import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { getMaterials } from '@/services/material.service'
import RepositoryView from '@/views/app/RepositoryView.vue'

vi.mock('@/services/material.service', () => ({
  getMaterials: vi.fn(),
  getMaterial: vi.fn(),
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

const REAL_MATERIAL = {
  mat_serial: 7,
  mat_title: 'Guía de Laravel',
  mat_code: 'GUI-LAR',
  mat_publication_date: '2026-10-04 00:00:00',
  mat_description: null,
  fk_materials_users: '9f1c2d3e-0000-4000-8000-000000000001',
}

async function mountView() {
  const wrapper = mount(RepositoryView, { global })
  await flushPromises()
  return wrapper
}

const cardLinks = (wrapper) => wrapper.findAll('a[href^="/app/repository/"]')

function chip(wrapper, label) {
  return wrapper.findAll('button').find((button) => button.text() === label)
}

describe('RepositoryView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('shows the loading skeleton while GET /materials is pending', async () => {
    vi.mocked(getMaterials).mockReturnValue(new Promise(() => {}))
    const wrapper = mount(RepositoryView, { global })
    await flushPromises()

    expect(wrapper.text()).toContain('Cargando…')
    expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows the six sample materials with the notice when the backend list is empty', async () => {
    vi.mocked(getMaterials).mockResolvedValue([])
    const wrapper = await mountView()

    expect(wrapper.get('[role="status"]').text()).toBe('Datos de ejemplo · Aún no se pueden crear materiales en el servidor')
    expect(cardLinks(wrapper)).toHaveLength(6)
    expect(wrapper.text()).toContain('6 materiales')
    expect(wrapper.text()).toContain('Tipo de recurso')
  })

  it('shows real materials without the notice and without sample-only chips', async () => {
    vi.mocked(getMaterials).mockResolvedValue([REAL_MATERIAL])
    const wrapper = await mountView()

    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(cardLinks(wrapper)).toHaveLength(1)
    expect(wrapper.text()).toContain('1 material')
    expect(wrapper.text()).not.toContain('Tipo de recurso')
  })

  it('filters sample materials by type, category and subject chips', async () => {
    vi.mocked(getMaterials).mockResolvedValue([])
    const wrapper = await mountView()

    await chip(wrapper, 'Manual').trigger('click')
    expect(cardLinks(wrapper)).toHaveLength(1)

    await chip(wrapper, 'Todos').trigger('click')
    await chip(wrapper, 'Web').trigger('click')
    expect(cardLinks(wrapper)).toHaveLength(2)

    await chip(wrapper, 'Desarrollo Web').trigger('click')
    expect(cardLinks(wrapper)).toHaveLength(2)
  })

  it('searches by title, author or code', async () => {
    vi.mocked(getMaterials).mockResolvedValue([])
    const wrapper = await mountView()
    const search = wrapper.get('input[type="search"]')

    await search.setValue('méndez')
    expect(cardLinks(wrapper)).toHaveLength(2)

    await search.setValue('cod-ed')
    expect(cardLinks(wrapper)).toHaveLength(1)

    await search.setValue('listas')
    expect(cardLinks(wrapper)).toHaveLength(1)
  })

  it('shows the empty state when no material matches and clears the filters', async () => {
    vi.mocked(getMaterials).mockResolvedValue([])
    const wrapper = await mountView()

    await chip(wrapper, 'Práctica').trigger('click')
    await chip(wrapper, 'Web').trigger('click')
    expect(wrapper.text()).toContain('Sin materiales que mostrar')

    await wrapper.findAll('button').filter((button) => button.text() === 'Limpiar filtros').at(-1).trigger('click')
    expect(cardLinks(wrapper)).toHaveLength(6)
  })

  it('shows the backend error with status and message, and retries', async () => {
    vi.mocked(getMaterials).mockRejectedValueOnce({ status: 500, message: 'Server Error' }).mockResolvedValueOnce([])
    const wrapper = await mountView()

    const alert = wrapper.get('[role="alert"]').text()
    expect(alert).toContain('No se pudo cargar el repositorio')
    expect(alert).toContain('Error 500 · Server Error')

    await chip(wrapper, 'Reintentar').trigger('click')
    await flushPromises()

    expect(getMaterials).toHaveBeenCalledTimes(2)
    expect(cardLinks(wrapper)).toHaveLength(6)
  })
})
